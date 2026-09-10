<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\DailyReport;
use App\Models\DailyReportSettings;
use App\Models\DataUnit;
use App\Models\Location;
use App\Models\Area;
use App\Models\UnitField;
use App\Models\UnitPosition;
use App\Models\Workshop;
use App\Services\UnitMovementLogger;
use DB;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Log;

class DataUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Mengambil daftar unit yang boleh diakses oleh user yang login (berdasarkan role)
    public static function getPermittedUnit()
    {
        $user = Auth::user()?->load('roleData');

        if (!$user) {
            return collect();
        }
        // Jika bukan super_admin, hanya ambil unit yang ditugaskan ke user tersebut
        if ($user->roleData?->name !== 'super_admin') {
            $temp = $user->UnitPositions()->with([
                'unit' => function ($q) {
                    $q->select(['unit_id', 'unit', 'unit_sn', 'old_sn', 'status', 'thresholdSetting', 'visibilitySetting']);
                },
                'client' => function ($q) {
                    $q->select(['client_id', 'name', 'gmt_offset']);
                },
                'workshop' => function ($q) {
                    $q->select(['workshop_id', 'name']);
                },
                'location.area.region',
                'region',
                'latestReport'
            ])->get()->makeHidden(['created_at', 'updated_at']);
            // Format ulang data unit non-admin ke struktur flat
            $data = $temp->map(function ($pos) {
                return [
                    'unit_id' => $pos->unit->unit_id,
                    'unit' => $pos->unit->unit,
                    'unit_sn' => $pos->unit->unit_sn,
                    'old_sn' => $pos->unit->old_sn,
                    'thresholdSetting' => $pos->unit->thresholdSetting,
                    'visibilitySetting' => $pos->unit->visibilitySetting,
                    'status' => $pos->unit->status,
                    'client' => $pos->client?->name ?? $pos->workshop?->name,
                    'client_id' => $pos->client_id,
                    'gmt_offset' => $pos->client?->gmt_offset ?? $pos->workshop?->gmt_offset ?? 7,
                    'location' => $pos->location?->location ?? null,
                    'location_id' => $pos->location_id ?? null,
                    'area' => $pos->location?->area?->area ?? null,
                    'area_id' => $pos->location?->area_id ?? null,
                    'region' => $pos->region?->name ?? $pos->location?->area?->region?->name ?? null,
                    'region_id' => $pos->region_id ?? $pos->location?->area?->region_id ?? null,
                    'unit_position_id' => $pos->id,
                    'latest_report' => $pos->latestReport
                ];
            });
        } else {
            // Super admin bisa melihat semua unit
            $temp = DataUnit::with([
                'UnitPositions.client' => function ($q) {
                    $q->select(['client_id', 'name', 'gmt_offset']);
                },
                'UnitPositions.location.area.region',
                'UnitPositions.region',
                'UnitPositions.latestReport',
                'UnitPositions.workshop' => function ($q) {
                    $q->select(['workshop_id', 'name']);
                },
            ])->select(['unit_id', 'unit', 'unit_sn', 'old_sn', 'status', 'thresholdSetting', 'visibilitySetting'])->get();

            // Format ulang data unit untuk super_admin ke struktur flat
            $data = $temp->map(function ($unit) {
                return [
                    'unit_id' => $unit->unit_id,
                    'unit' => $unit->unit,
                    'unit_sn' => $unit->unit_sn,
                    'old_sn' => $unit->old_sn,
                    'thresholdSetting' => $unit->thresholdSetting,
                    'visibilitySetting' => $unit->visibilitySetting,
                    'status' => $unit->status,
                    'client' => $unit->UnitPositions?->client?->name ?? $unit->UnitPositions?->workshop?->name,
                    'client_id' => $unit->UnitPositions?->client_id,
                    'gmt_offset' => $unit->UnitPositions?->client?->gmt_offset ?? $unit->UnitPositions?->workshop?->gmt_offset ?? 7,
                    'location_id' => $unit->UnitPositions?->location_id,
                    'location' => $unit->UnitPositions?->location?->location ?? null,
                    'area' => $unit->UnitPositions?->location?->area?->area ?? null,
                    'area_id' => $unit->UnitPositions?->location?->area_id ?? null,
                    'region' => $unit->UnitPositions?->region?->name ?? $unit->UnitPositions?->location?->area?->region?->name ?? null,
                    'region_id' => $unit->UnitPositions?->region_id ?? $unit->UnitPositions?->location?->area?->region_id ?? null,
                    'unit_position_id' => $unit->UnitPositions?->id ?? null,
                    'latest_report' => $unit->UnitPositions?->latestReport
                ];
            });
        }
        return $data;
    }

    // Mengambil semua unit yang diizinkan, dengan opsi filter berdasarkan status
    public function getAllUnit(Request $request)
    {
        $filterStatus = $request->query('status');

        $units = self::getPermittedUnit();

        if ($filterStatus) {
            $units = $units->filter(function ($item) use ($filterStatus) {
                return optional($item->unit)->status === $filterStatus;
            });
        }

        return response()->json($units->values(), 200);
    }

    // Menampilkan halaman daftar unit dengan pagination dan filter status
    public function unitList(Request $request)
    {
        $status = $request->query('status');
        $perPage = 10;
        $page = max(1, (int) $request->query('page', 1));

        $units = self::getPermittedUnit();

        if ($status) {
            $units = $units->filter(function ($item) use ($status) {
                return $item['status'] === $status;
            });
        }

        $units = $units->values();

        // Buat pagination manual dari collection
        $paginated = (new LengthAwarePaginator(
            $units->forPage($page, $perPage)->values(),
            $units->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
            ]
        ))->appends($request->except('page'));

        return Inertia::render('Daily/DailyList', [
            'data' => $paginated,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    // Mengambil daftar unit yang diizinkan dalam format JSON
    public function getUnit()
    {
        $data = $this->getPermittedUnit();

        return response()->json($data);
    }

    // Data unit itu sendiri (status, client, area, dst) SAMA untuk semua orang yang
    // boleh lihat unit itu -- yang beda cuma UNIT MANA SAJA yang boleh dilihat tiap
    // user (izin akses), bukan datanya. Jadi cache-nya dipisah jadi 2 lapis:
    // 1. Cache SATU dataset besar berisi SEMUA unit (di bawah ini), dipakai bareng-
    //    bareng oleh semua user -- bukan digandakan per user seperti sebelumnya.
    // 2. Baru difilter di PHP (bukan cache lagi) sesuai unit mana yang diizinkan
    //    untuk user yang sedang minta.
    // Ini lebih hemat daripada cache per-user (yang isinya sering duplikat kalau
    // banyak super_admin lihat data yang sama), dan juga lebih murah daripada cache
    // per-unit satu-satu (karena CACHE_STORE di .env masih "file" -- baca N file
    // kecil kemungkinan malah lebih lambat daripada 1 query sekalian).
    private static function getAllUnitsFlat()
    {
        $temp = DataUnit::with([
            'UnitPositions.client' => function ($q) {
                $q->select(['client_id', 'name', 'gmt_offset']);
            },
            'UnitPositions.location.area.region',
            'UnitPositions.region',
            'UnitPositions.latestReport',
            'UnitPositions.workshop' => function ($q) {
                $q->select(['workshop_id', 'name']);
            },
        ])->select(['unit_id', 'unit', 'unit_sn', 'old_sn', 'status', 'thresholdSetting', 'visibilitySetting'])->get();

        return $temp->map(function ($unit) {
            return [
                'unit_id' => $unit->unit_id,
                'unit' => $unit->unit,
                'unit_sn' => $unit->unit_sn,
                'old_sn' => $unit->old_sn,
                'thresholdSetting' => $unit->thresholdSetting,
                'visibilitySetting' => $unit->visibilitySetting,
                'status' => $unit->status,
                'client' => $unit->UnitPositions?->client?->name ?? $unit->UnitPositions?->workshop?->name,
                'client_id' => $unit->UnitPositions?->client_id,
                'gmt_offset' => $unit->UnitPositions?->client?->gmt_offset ?? $unit->UnitPositions?->workshop?->gmt_offset ?? 7,
                'location_id' => $unit->UnitPositions?->location_id,
                'location' => $unit->UnitPositions?->location?->location ?? null,
                'area' => $unit->UnitPositions?->location?->area?->area ?? null,
                'area_id' => $unit->UnitPositions?->location?->area_id ?? null,
                'region' => $unit->UnitPositions?->region?->name ?? $unit->UnitPositions?->location?->area?->region?->name ?? null,
                'region_id' => $unit->UnitPositions?->region_id ?? $unit->UnitPositions?->location?->area?->region_id ?? null,
                'unit_position_id' => $unit->UnitPositions?->id ?? null,
                'latest_report' => $unit->UnitPositions?->latestReport,
            ];
        });
    }

    // Mengambil status seluruh unit yang diizinkan
    // Endpoint ini di-polling tiap 10 detik oleh dashboard Home.jsx. Query dasarnya
    // (getAllUnitsFlat) di-cache 5 detik dan dipakai bareng oleh SEMUA user -- baru
    // setelah itu difilter sesuai unit mana yang boleh dilihat user yang sedang login.
    public function getUnitStatus()
    {
        $user = Auth::user()?->load('roleData');
        if (!$user) {
            return response()->json([]);
        }

        $allUnits = Cache::remember('unit-status:all-units', 5, function () {
            return self::getAllUnitsFlat();
        });

        // Super admin boleh lihat semua unit -- tidak perlu difilter lagi
        if ($user->roleData?->name === 'super_admin') {
            return response()->json($allUnits->values());
        }

        // Non-admin: cari unit_id mana saja yang di-assign ke user ini (query ringan,
        // cuma ambil id, bukan join berat seperti getAllUnitsFlat), lalu filter dataset
        // yang sudah di-cache di atas -- tidak query ulang ke database untuk datanya.
        $permittedUnitIds = $user->UnitPositions()
            ->with(['unit:unit_id'])
            ->get()
            ->pluck('unit.unit_id')
            ->filter()
            ->values();

        $data = $allUnits->filter(function ($item) use ($permittedUnitIds) {
            return $permittedUnitIds->contains($item['unit_id']);
        });

        return response()->json($data->values());
    }

    /**
     * Store a newly created resource in storage.
     */
    // Menampilkan halaman pengaturan unit
    public function unitSetting(Request $request)
    {
        return Inertia::render('Unit/UnitSetting');
    }

    /**
     * Display the specified resource.
     */
    // Mengatur interval input data untuk unit-unit yang dipilih
    public function setInterval(Request $request)
    {
        $val = $request->validate([
            'selected' => 'required|array',
            'input_interval' => 'required|integer|between:1,24',
        ]);

        // Update all matching DataUnit records
        DataUnit::whereIn('unit_id', $val['selected'])
            ->update(['input_interval' => $val['input_interval']]);

        return response()->json(['type' => 'success', 'text' => 'Input Interval updated!']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    // Mengambil detail data satu unit berdasarkan unit_position_id, untuk halaman edit
    public function getSelectedUnit(Request $request)
    {
        $unit = UnitPosition::with(['client', 'unit', 'dailyReportSetting', 'location.area', 'workshop'])
            ->where('id', $request->unit_position_id)->first();

        // Susun data unit lengkap dengan info tambahan untuk ditampilkan di form
        $data = [
            'unit_id' => $unit->unit_id ?? null,
            'visibilitySetting' => $unit->unit->visibilitySetting ?? null,
            'thresholdSetting' => $unit->unit->thresholdSetting ?? null,
            'daily_report_setting' => $unit->dailyReportSetting ?? null,
            'unit' => $unit->unit->unit ?? null,
            'status' => $unit->unit->status ?? null,
            'client' => $unit->client?->name ?? $unit->workshop?->name ?? null,
            'input_interval' => $unit->client?->input_interval ?? null,
            'input_duration' => $unit->client?->input_duration ?? null,
            'gmt_offset' => $unit->client?->gmt_offset ?? null,
            'disable_duration' => (bool) $unit->client?->disable_duration ?? false,
            'location' => $unit->location?->location ?? null,
            'area' => $unit->location?->area?->area ?? null,
            'unit_position_id' => $unit->id ?? null,
            'info' => [
                'unit' => $unit->unit->unit ?? null,
                'unit_sn' => $unit->unit->unit_sn ?? null,
                'client' => $unit->client?->name ?? $unit->workshop?->name ?? null,
                'area' => $unit->location?->area?->area ?? null,
                'contract_ref' => $unit->unit->contract_ref ?? 'Booster',
                'location' => $unit->location?->location ?? null,
                'application' => $unit->unit->application ?? 'Booster',
                'engine_sn' => $unit->unit->engine_sn ?? null,
                'office_size' => $unit->unit->office_size ?? null,
                'config' => $unit->unit->config ?? null,
            ]
        ];


        return response()->json($data);
    }

    // ADD NEW UNIT

    // Menampilkan halaman form tambah unit baru, beserta data referensi (client, workshop, dll)
    public function create()
    {
        $clients = Client::all();
        $workshops = Workshop::all();
        $locations = Location::all();
        $areas = Area::all();

        return inertia('Unit/UnitAddNew', [
            'clients' => $clients,
            'workshops' => $workshops,
            'locations' => $locations,
            'areas' => $areas,
        ]);
    }

    // Menyimpan unit baru beserta posisi (client atau workshop) dan area/lokasi terkait
    public function addNewUnit(Request $request)
    {
        $rules = [
            'unit' => 'required|string',
            'status' => 'required|string',
            'position_type' => 'required|in:client,workshop',
            'area_id' => 'nullable|exists:areas,id',
            'area_name' => 'nullable|string',
            'location_id' => 'nullable|exists:locations,id',
            'location_name' => 'nullable|string',
        ];

        // Rule tambahan tergantung posisi unit (client / workshop)
        if ($request->position_type === 'client') {
            $rules['client_id'] = 'nullable|exists:clients,client_id';
            $rules['client_name'] = 'nullable|string';
        } elseif ($request->position_type === 'workshop') {
            $rules['workshop_id'] = 'nullable|exists:workshops,workshop_id';
            $rules['workshop_name'] = 'nullable|string';
        }

        $val = $request->validate($rules);

        // Validasi manual: minimal salah satu dari id/name client harus ada
        if ($request->position_type === 'client' && !$request->client_id && !$request->client_name) {
            return response()->json([
                'errors' => ['client' => ['Either client_id or client_name is required.']]
            ], 422);
        }

        // Validasi manual: minimal salah satu dari id/name workshop harus ada
        if ($request->position_type === 'workshop' && !$request->workshop_id && !$request->workshop_name) {
            return response()->json([
                'errors' => ['workshop' => ['Either workshop_id or workshop_name is required.']]
            ], 422);
        }

        // Gunakan transaksi DB agar semua insert konsisten (unit, area, lokasi, client/workshop, position)
        DB::transaction(function () use ($val) {

            $areaId = null;
            $locationId = null;

            // 1. Handle Area
            // Buat area baru bila belum dipilih dari yang sudah ada (hanya untuk posisi client)
            if ($val['position_type'] === 'client') {
                if (!empty($val['area_id'])) {
                    $areaId = $val['area_id'];
                } else {
                    $area = Area::create([
                        'area' => $val['area_name'],
                    ]);
                    $areaId = $area->id;
                }

                // 2. Handle Location
                // Buat lokasi baru bila belum dipilih dari yang sudah ada
                if (!empty($val['location_id'])) {
                    $locationId = $val['location_id'];
                } else {
                    $location = Location::create([
                        'area_id' => $areaId,
                        'location' => $val['location_name'],
                    ]);
                    $locationId = $location->id;
                }
            }

            // 3. Create Unit
            // Buat data unit baru
            $unit = DataUnit::create([
                'unit' => $val['unit'],
                'status' => $val['status'],
            ]);

            $clientId = null;
            $workshopId = null;

            // Buat/gunakan client atau workshop sesuai position_type
            if ($val['position_type'] === 'client') {
                $clientId = !empty($val['client_id'])
                    ? $val['client_id']
                    : Client::create([
                        'name' => $val['client_name'],
                    ])->client_id;
            } else {
                $workshopId = !empty($val['workshop_id'])
                    ? $val['workshop_id']
                    : Workshop::create([
                        'name' => $val['workshop_name'],
                    ])->workshop_id;
            }

            // Simpan posisi unit (relasi unit ke client/workshop/lokasi)
            $position = $unit->UnitPositions()->create([
                'client_id' => $clientId,
                'location_id' => $locationId,
                'workshop_id' => $workshopId,
                'position_type' => $val['position_type'],
            ]);

            UnitMovementLogger::logCreated($position);

            return $unit;
        });

        return response()->json(['type' => 'success', 'text' => 'Unit added successfully']);
    }

    /**
     * Update the specified resource in storage.
     */
    // Menampilkan halaman posisi unit
    public function unitLocation()
    {
        return Inertia::render('Unit/Positions');
    }

    // Menampilkan halaman pengaturan posisi unit untuk workshop/client tertentu
    public function unitLocationSetting(Request $request)
    {
        $request->validate([
            'workshop_id' => 'nullable|exists:workshops,workshop_id|required_without:client_id',
            'client_id' => 'nullable|exists:clients,client_id|required_without:workshop_id',
        ]);
        $data = [];
        if ($request->workshop_id) {
            $data = Workshop::with(['units'])
                ->where('workshop_id', $request->workshop_id)->first();
        } elseif ($request->client_id) {
            $data = Client::with(['units'])
                ->where('client_id', $request->client_id)->first();
        }
        return Inertia::render('Unit/UnitPositionSetting', [
            'data' => $data
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    // Menetapkan unit-unit terpilih ke sebuah workshop atau client
    public function addUnitLocation(Request $request)
    {
        $val = $request->validate([
            'workshop_id' => 'nullable|exists:workshops,workshop_id|required_without:client_id',
            'client_id' => 'nullable|exists:clients,client_id|required_without:workshop_id',
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:data_units,unit_id',
        ]);

        $workshopId = $val['workshop_id'] ?? null;
        $clientId = $val['client_id'] ?? null;
        $before = UnitMovementLogger::snapshot($val['unit_ids']);
        UnitPosition::whereIn('unit_id', $val['unit_ids'])
            ->update([
                'workshop_id' => $workshopId,
                'client_id' => $clientId,
                'position_type' => $workshopId ? 'workshop' : 'client',
                'updated_at' => now(),
            ]);
        UnitMovementLogger::commit($before, $workshopId ? 'assign_workshop' : 'assign_client');

        return response()->json([
            'type' => 'success',
            'text' => 'Units added successfully',
            // 'inserted' => count($newData),
            // 'skipped' => count($existing),
        ]);
    }

    // Melepas unit-unit terpilih dari workshop/client (client_id & workshop_id di-null-kan)
    public function removeUnitLocation(Request $request)
    {
        $val = $request->validate([
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:data_units,unit_id',
        ]);

        $before = UnitMovementLogger::snapshot($val['unit_ids']);
        UnitPosition::whereIn('unit_id', $val['unit_ids'])
            ->update([
                'workshop_id' => null,
                'client_id' => null,
                'position_type' => null,
                'updated_at' => now(),
            ]);
        UnitMovementLogger::commit($before, 'remove_client');

        return response()->json([
            'type' => 'success',
            'text' => 'Units removed successfully',
        ]);
    }

    // Menampilkan halaman relokasi unit
    public function relocateUnitPage()
    {
        return Inertia::render('Unit/RelocateUnit');
    }

    // Menampilkan halaman pengaturan area/lokasi untuk unit-unit pada sebuah lokasi
    public function unitAreaLocationSetting(Request $request)
    {
        $request->validate([
            'location_id' => 'required|exists:locations,id',
        ]);

        $location = Location::with(['area', 'units'])
            ->findOrFail($request->location_id);

        return Inertia::render('Unit/UnitAreaLocationSetting', [
            'data' => $location
        ]);
    }

    // Menetapkan unit-unit terpilih ke sebuah lokasi
    public function addUnitAreaLocation(Request $request)
    {
        $val = $request->validate([
            'location_id' => 'required|exists:locations,id',
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:data_units,unit_id',
        ]);

        $before = UnitMovementLogger::snapshot($val['unit_ids']);
        UnitPosition::whereIn('unit_id', $val['unit_ids'])
            ->update([
                'location_id' => $val['location_id'],
                'updated_at' => now(),
            ]);
        UnitMovementLogger::commit($before, 'assign_location');

        return response()->json([
            'type' => 'success',
            'text' => 'Units assigned to location successfully',
        ]);
    }

    // Melepas unit-unit terpilih dari lokasi (location_id di-null-kan)
    public function removeUnitAreaLocation(Request $request)
    {
        $val = $request->validate([
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:data_units,unit_id',
        ]);

        $before = UnitMovementLogger::snapshot($val['unit_ids']);
        UnitPosition::whereIn('unit_id', $val['unit_ids'])
            ->update([
                'location_id' => null,
                'updated_at' => now(),
            ]);
        UnitMovementLogger::commit($before, 'remove_location');

        return response()->json([
            'type' => 'success',
            'text' => 'Units removed from location successfully',
        ]);
    }

    // Mengupdate sebagian info unit (hanya field yang tidak null/kosong yang diupdate)
    public function updateUnitInfo(Request $request)
    {
        $val = $request->validate([
            "unit_id" => "required|exists:data_units,unit_id",
            "data" => "required|array"
        ]);

        // Buang field yang null atau string kosong sebelum update
        $data = collect($val['data'])
            ->filter(function ($value) {
                return $value !== null && $value !== '';
            })
            ->toArray();

        DataUnit::where("unit_id", $val["unit_id"])
            ->update($data);

        return response()->json([
            "type" => "success",
            "text" => "Unit Updated"
        ]);
    }

    // Mengupdate data unit dan posisi unit sekaligus (data unit dan data posisi terpisah)
    public function updateUnitFull(Request $request)
    {
        $val = $request->validate([
            'unit_id' => 'required|exists:data_units,unit_id',
            'unit' => 'nullable|string|max:255',
            'unit_sn' => 'nullable|string|max:255',
            'old_sn' => 'nullable|string|max:255',
            'client_id' => 'nullable|exists:clients,client_id',
            'location_id' => 'nullable|exists:locations,id',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        DB::transaction(function () use ($val) {
            // Ambil field yang termasuk data unit
            $unitData = collect($val)->only(['unit', 'unit_sn', 'old_sn'])
                ->filter(fn($value) => $value !== null)
                ->toArray();

            if (!empty($unitData)) {
                DataUnit::where('unit_id', $val['unit_id'])->update($unitData);
            }

            // Ambil field yang termasuk data posisi unit
            $positionData = collect($val)->only(['client_id', 'location_id', 'region_id'])
                ->filter(fn($value) => $value !== null)
                ->toArray();

            if (!empty($positionData)) {
                $before = UnitMovementLogger::snapshot([$val['unit_id']]);
                UnitPosition::where('unit_id', $val['unit_id'])->update($positionData);
                UnitMovementLogger::commit($before, 'relocate');
            }
        });

        return response()->json([
            'type' => 'success',
            'text' => 'Unit updated successfully',
        ]);
    }

    // Data buat tab "Unit Placement" di Database: unit dikelompokkan per client,
    // per workshop, dan unit yang belum ditempatkan sama sekali (belum punya
    // client_id maupun workshop_id).
    public function getUnitPlacement()
    {
        $unitSelect = ['unit_id', 'unit', 'status'];
        // 'units' di Workshop itu belongsToMany lewat unit_positions -- query-nya JOIN
        // data_units dengan unit_positions, dan keduanya sama-sama punya kolom unit_id,
        // jadi select-nya wajib di-qualify (data_units.unit_id) supaya tidak ambiguous.
        $qualifiedUnitSelect = ['data_units.unit_id', 'data_units.unit', 'data_units.status'];

        $clients = Client::with(['unitPositions.unit' => function ($q) use ($unitSelect) {
            $q->select($unitSelect);
        }])->get()->map(function ($client) {
            return [
                'client_id' => $client->client_id,
                'name' => $client->name,
                'units' => $client->unitPositions->pluck('unit')->filter()->values(),
            ];
        });

        $workshops = Workshop::with(['units' => function ($q) use ($qualifiedUnitSelect) {
            $q->select($qualifiedUnitSelect);
        }])->get()->map(function ($workshop) {
            return [
                'workshop_id' => $workshop->workshop_id,
                'name' => $workshop->name,
                'units' => $workshop->units->values(),
            ];
        });

        $unassigned = DataUnit::where(function ($q) {
            $q->whereDoesntHave('unitPositions')
                ->orWhereHas('unitPositions', function ($q2) {
                    $q2->whereNull('client_id')->whereNull('workshop_id');
                });
        })->get($unitSelect);

        return response()->json([
            'clients' => $clients,
            'workshops' => $workshops,
            'unassigned' => $unassigned,
        ]);
    }

    // Halaman "Unit Movement Log" -- daftar SEMUA riwayat pergerakan unit
    // (super_admin only, lihat routes/web.php).
    public function movementLogPage()
    {
        return Inertia::render('Unit/MovementLog');
    }

    // Riwayat pergerakan (perubahan client/region/location) unit, terbaru duluan.
    // Tanpa `unit_id` -> semua unit, dipaginate (dipakai halaman Movement Log).
    // Dengan `unit_id` -> cuma unit itu, tidak dipaginate (dipakai modal History
    // di List of Unit).
    public function getUnitMovementLog(Request $request)
    {
        $request->validate([
            'unit_id' => 'nullable|exists:data_units,unit_id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = \App\Models\UnitMovementLog::with([
            'unit:unit_id,unit',
            'fromClient:client_id,name',
            'toClient:client_id,name',
            'fromRegion:id,name',
            'toRegion:id,name',
            'fromLocation:id,location,area_id',
            'fromLocation.area:id,area',
            'toLocation:id,location,area_id',
            'toLocation.area:id,area',
            'changedByUser:user_id,name',
        ])
            ->orderByDesc('created_at');

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->unit_id) {
            $query->where('unit_id', $request->unit_id);

            return response()->json($query->get());
        }

        return response()->json($query->paginate(30)->withQueryString());
    }


    // Mengambil daftar field laporan yang terdaftar untuk sebuah unit
    public function getUnitFields(Request $request)
    {
        $unitFields = UnitField::where("unit_id", $request->unit_id)
            ->with('fields.subfields')
            ->get();

        // Sertakan 'required' dari pivot unit_fields (bukan cuma data field-nya
        // sendiri) -- dipakai buat toggle Required di Unit Setting, dan buat
        // validasi wajib/tidaknya field ini pas isi laporan (lihat setReport).
        $fields = $unitFields->map(function ($uf) {
            return [
                ...$uf->fields->toArray(),
                'field_id' => $uf->field_id,
                'required' => (bool) $uf->required,
            ];
        });

        return response()->json($fields);
    }
    // Mengatur threshold, visibility, required, dan curve_percentage untuk unit-unit terpilih
    public function setUnitSetting(Request $request)
    {
        $rules = [
            'unit_id' => 'required|array',
            'thresholdSetting' => 'required|array',
            'visibilitySetting' => 'required|array',
            // requiredSetting di-keyin per field_id (bukan slug), karena disimpan
            // di tabel unit_fields yang PK-nya field_id, bukan di kolom JSON milik unit.
            'requiredSetting' => 'nullable|array',
            'curve_percentage' => 'nullable|numeric|min:0|max:200'
        ];

        // Bangun rule validasi dinamis untuk tiap key threshold
        foreach ($request->input('thresholdSetting', []) as $key => $value) {
            $rules["thresholdSetting.$key.value"] = 'required|numeric';
            $rules["thresholdSetting.$key.type"] = 'required|string';
        }

        // Bangun rule validasi dinamis untuk tiap key visibility
        foreach ($request->input('visibilitySetting', []) as $key => $value) {
            $rules["visibilitySetting.$key"] = 'required|boolean';
        }

        // Bangun rule validasi dinamis untuk tiap key required
        foreach ($request->input('requiredSetting', []) as $key => $value) {
            $rules["requiredSetting.$key"] = 'required|boolean';
        }

        $validated = $request->validate($rules);

        $unit_ids = $validated['unit_id'];

        // Terapkan pengaturan yang sama ke semua unit terpilih
        foreach ((array) $unit_ids as $unit_id) {
            $unit = DataUnit::where('unit_id', $unit_id)->first();
            if (!$unit) {
                continue; // Skip if unit not found
            }
            $unit->update([
                'thresholdSetting' => $validated['thresholdSetting'],
                'visibilitySetting' => $validated['visibilitySetting'],
                'curve_percentage' => $validated['curve_percentage'] ?? $unit->curve_percentage,
            ]);

            // Required disimpan per-baris di unit_fields (bukan JSON di data_units),
            // jadi update tiap field_id satu-satu. Hanya UPDATE baris yang sudah ada
            // (bukan create) karena unit_fields.column itu NOT NULL & tidak kita tahu
            // nilainya di sini -- baris unit_fields untuk field ini seharusnya sudah
            // di-seed lebih dulu waktu field itu di-assign ke unit.
            foreach ($validated['requiredSetting'] ?? [] as $field_id => $isRequired) {
                UnitField::where('unit_id', $unit_id)
                    ->where('field_id', $field_id)
                    ->update(['required' => $isRequired]);
            }
        }

        return response()->json(['text' => 'Settings updated successfully', 'type' => 'success'], 200);
    }

    // Mengambil laporan harian sebuah unit, bisa difilter berdasarkan tanggal atau bulan
    // Mengambil laporan harian sebuah unit, bisa difilter berdasarkan tanggal tunggal, rentang tanggal, atau bulan
    public function getUnitReports(Request $request, $unit_position_id)
    {
        $query = DailyReport::where('unit_position_id', $unit_position_id);

        if ($date = $request->query('date')) {
            $query->where('date', $date);
        } elseif ($start = $request->query('start')) {
            // Rentang tanggal; kalau 'end' tidak dikirim, anggap sama dengan start (1 hari)
            $end = $request->query('end') ?: $start;
            $query->whereBetween('date', [$start, $end]);
        } elseif ($month = $request->query('month')) {
            // Validasi format YYYY-MM agar tidak jadi LIKE wildcard yang tidak disengaja
            if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
                return response()->json(['success' => false, 'message' => 'Invalid month format, expected YYYY-MM'], 422);
            }
            $query->where('date', 'like', $month . '%');
        }

        $reports = $query->pluck('data');

        // Ambil satuan (unit pengukuran per field) dari client pemilik unit ini -- bisa beda tiap client
        $unitPosition = UnitPosition::find($unit_position_id);
        $satuan = [];
        if ($unitPosition?->client_id) {
            $settings = DailyReportSettings::where('client_id', $unitPosition->client_id)->first();
            $satuan = $settings?->unitSetting ?? [];
        }

        return response()->json([
            'success' => true,
            'data' => $reports,
            'satuan' => $satuan,
        ]);
    }

    // Mengambil laporan harian SEMUA unit dalam satu area sekaligus (1 request, bukan N request per unit)
    public function getAreaReports(Request $request, $area_id)
    {
        $unitPositionIds = UnitPosition::whereHas('location', function ($q) use ($area_id) {
            $q->where('area_id', $area_id);
        })->pluck('id', 'id');

        if ($unitPositionIds->isEmpty()) {
            return response()->json(['success' => true, 'units' => []]);
        }

        $query = DailyReport::whereIn('unit_position_id', $unitPositionIds);

        if ($date = $request->query('date')) {
            $query->where('date', $date);
        } elseif ($start = $request->query('start')) {
            $end = $request->query('end') ?: $start;
            $query->whereBetween('date', [$start, $end]);
        } elseif ($month = $request->query('month')) {
            if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
                return response()->json(['success' => false, 'message' => 'Invalid month format, expected YYYY-MM'], 422);
            }
            $query->where('date', 'like', $month . '%');
        }

        // Kelompokkan report per unit_position_id dalam 1 query, bukan query terpisah per unit
        $reportsByUnit = $query->get(['unit_position_id', 'data'])
            ->groupBy('unit_position_id');

        // Ambil nama unit + client_id sekaligus (1 query), bukan N query
        $unitPositions = UnitPosition::whereIn('id', $unitPositionIds)
            ->with(['unit:unit_id,unit', 'client:client_id'])
            ->get(['id', 'unit_id', 'client_id']);

        // Ambil semua unitSetting (satuan) yang relevan sekaligus (1 query), bukan N query
        $clientIds = $unitPositions->pluck('client_id')->filter()->unique();
        $satuanByClient = DailyReportSettings::whereIn('client_id', $clientIds)
            ->pluck('unitSetting', 'client_id');

        $units = $unitPositions->map(function ($pos) use ($reportsByUnit, $satuanByClient) {
            return [
                'unit_position_id' => $pos->id,
                'unit' => $pos->unit?->unit,
                'data' => ($reportsByUnit->get($pos->id) ?? collect())->pluck('data')->values(),
                'satuan' => $satuanByClient->get($pos->client_id) ?? [],
            ];
        })->values();

        return response()->json(['success' => true, 'units' => $units]);
    }

}