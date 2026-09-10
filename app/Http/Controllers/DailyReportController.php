<?php

namespace App\Http\Controllers;

use App\Models\Curve;
use App\Models\DailyReport;
use App\Models\DailyReportSettings;
use App\Models\DataUnit;
use App\Models\StatusRequest;
use App\Models\UnitField;
use App\Models\UnitPosition;
use App\Models\UserSetting;
use App\Services\WhatsAppService;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class DailyReportController extends Controller
{
    // Cek apakah user yang login boleh mengakses unit_position_id ini (super_admin selalu boleh)
    private function userCanAccessUnitPosition($user, $unitPositionId): bool
    {
        if (($user?->roleData?->name ?? null) === 'super_admin') {
            return true;
        }
        return UserSetting::where('user_id', $user->user_id)
            ->where('unit_position_id', $unitPositionId)
            ->exists();
    }

    // Hitung performance & performance_24h.
    // performance_24h dibagi curve_24h seperti biasa, KECUALI client punya performanceFixedValue
    // di setting-nya -- kalau diisi, itu yang dipakai sebagai pembagi, bukan curve_24h.
    private function calculatePerformance($unitPosition, ?float $curveValue, ?float $curve24h, float $flowrate): array
    {
        $performance = $curveValue ? $flowrate / $curveValue * 100 : null;

        $performanceFixedValue = $unitPosition?->client_id
            ? DailyReportSettings::where('client_id', $unitPosition->client_id)->value('performanceFixedValue')
            : null;
        // 0/null/kosong dianggap "belum di-set" -> tetap pakai curve_24h, bukan dibagi 0
        $performanceDivisor = $performanceFixedValue > 0 ? (float) $performanceFixedValue : $curve24h;
        $performance24h = $performanceDivisor ? $flowrate / $performanceDivisor * 100 : null;

        return [$performance, $performance24h];
    }

    // Ambil map slug field -> wajib diisi atau tidak (dari unit_fields.required),
    // dipakai buat bangun rule validasi dinamis di setReport/editReport. Subfield
    // tidak punya kolom 'required' sendiri, jadi ikut nilai required field induknya.
    // Kalau belum ada baris unit_fields untuk field itu, default-nya WAJIB (aman,
    // sama seperti behavior lama sebelum fitur ini ada).
    private function getRequiredFieldMap($unitId): array
    {
        $map = [];
        UnitField::where('unit_id', $unitId)
            ->with('fields.subfields')
            ->get()
            ->each(function ($uf) use (&$map) {
                $isRequired = (bool) $uf->required;
                $slug = $uf->fields?->slug;
                if ($slug) {
                    $map[$slug] = $isRequired;
                }
                foreach ($uf->fields?->subfields ?? [] as $sub) {
                    $map[$sub->slug] = $isRequired;
                }
            });
        return $map;
    }

    // Mengambil data laporan harian sebuah unit beserta field yang perlu ditampilkan
    public function getDailyReport(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');
        $unit_position_id = $request->query('id');
        $unit_id = $request->query('unit_id');

        if (!$unit_position_id || !$start || !$end || !$unit_id) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }
        // $unitData = DataUnit::find($unit_id);
        // $fields = UnitField::with('fields.subfields')->where('unit_id', $unit_id)->get()->map(function ($item) {
        //     return [
        //         'column' => $item->column,
        //         'field_name' => $item->fields['name'],
        //         'field_slug' => $item->fields['slug'],
        //         'subfields' => $item->fields['subfields'] ?? [],
        //     ];
        // });
        $unitData = DataUnit::where('unit_id', $unit_id)->first();
        Log::debug($unitData);
        if (!$unitData) {
            return response()->json([
                'error' => 'Unit not found'
            ], 404);
        }

        // Ambil daftar field laporan unit ini, filter hanya yang visible sesuai pengaturan unit
        $fields = UnitField::with('fields.subfields')
            ->where('unit_id', $unit_id)
            ->get()
            ->map(function ($item) use ($unitData) {
                $field = $item->fields;
                // Ambil subfield yang visibilitas-nya aktif
                $visibleSubfields = collect($field->subfields ?? [])
                    ->filter(function ($sub) use ($unitData) {
                        return $unitData->visibilitySetting[$sub->slug] ?? false;
                    })
                    ->values();

                return [
                    'column' => $item->column,
                    'field_name' => $field->name,
                    'field_slug' => $field->slug,
                    'visible' => $unitData->visibilitySetting[$field->slug] ?? false,
                    'subfields' => $visibleSubfields,
                ];
            })
            // Hanya sertakan field yang visible atau punya subfield yang visible
            ->filter(function ($field) {
                return $field['visible'] || $field['subfields']->isNotEmpty();
            })
            ->values();

        // Ambil data laporan harian dalam rentang tanggal yang diminta
        $reports = DailyReport::where('unit_position_id', $unit_position_id)
            ->whereBetween('date', [$start, $end])
            ->with('request')
            ->get()
            ->map(function ($item) {
                $data = $item->data;

                // Decode data JSON jika masih berupa string
                if (is_string($data)) {
                    $data = json_decode($data, true) ?? [];
                }

                return array_merge([
                    'id' => $item->id,
                    'unit_position_id' => $item->unit_position_id,
                    'date' => $item->date,
                    'time' => $item->time,
                ], $data, [
                    'request' => $item->request,
                ]);
            });



        return response()->json(['reports' => $reports, 'fields' => $fields]);
    }


    // public function unitList()
    // {
    //     $user = Auth::user();
    //     // dd($user->role);
    //     if ($user->role == 'technician' || $user->role == 'operator') {
    //         $data = $user->UnitPositions()->with([
    //             'unit' => function ($q) {
    //                 $q->select(['unit_id', 'unit']);
    //             },
    //             'client' => function ($q) {
    //                 $q->select(['client_id', 'name']);
    //             }
    //         ])->get()->makeHidden(['created_at', 'updated_at']);
    //     } else {
    //         $data = UnitPosition::with([
    //             'unit' => function ($q) {
    //                 $q->select(['unit_id', 'unit']);
    //             },
    //             'client' => function ($q) {
    //                 $q->select(['client_id', 'name']);
    //             }
    //         ])->get()->makeHidden(['created_at', 'updated_at']);
    //     }
    //     ;

    //     return Inertia::render('Daily/DailyList', ['data' => $data]);
    // }

    // Menyimpan laporan harian baru untuk sebuah unit
    public function setReport(Request $request, $unit_position_id)
    {
        // Hanya role tertentu yang boleh mengisi laporan
        $userRole = auth()->user()?->roleData?->name;
        if (!in_array($userRole, ['operator', 'super_admin', 'technician'])) {
            return response()->json(['type' => 'error', 'text' => 'You are not authorized to fill this report.'], 403);
        }

        // Pastikan user memang ditugaskan ke unit ini, bukan sekadar punya role yang tepat
        if (!$this->userCanAccessUnitPosition(auth()->user(), $unit_position_id)) {
            return response()->json(['type' => 'error', 'text' => 'You are not assigned to this unit.'], 403);
        }

        if (!$unit_position_id) {
            return response()->json(['type' => 'error', 'text' => 'Unit position ID tidak ditemukan.']);
        }

        $fieldsToNormalize = $request->fields ?? [];
        $data = $request->data ?? [];

        // Normalisasi angka: ubah koma jadi titik agar valid sebagai numeric
        foreach ($fieldsToNormalize as $field) {
            if (isset($data[$field])) {
                $data[$field] = str_replace(',', '.', $data[$field]);
            }
        }

        $request->merge(['data' => $data]);

        // Bangun rule validasi secara dinamis berdasarkan field yang dikirim,
        // dan wajib/tidaknya tiap field sesuai unit_fields.required unit ini.
        $unitIdForRules = UnitPosition::find($unit_position_id)?->unit_id;
        $requiredMap = $unitIdForRules ? $this->getRequiredFieldMap($unitIdForRules) : [];

        $rules = [];
        foreach ($fieldsToNormalize as $field) {
            if (in_array($field, ['date', 'time'])) {
                $rules["data.$field"] = 'required|string';
                continue;
            }
            $isRequired = $requiredMap[$field] ?? true;
            $rules["data.$field"] = ($isRequired ? 'required' : 'nullable') . '|numeric';
        }

        $validatedData = $request->validate($rules);
        $validated = $validatedData['data'];

        // Hitung nilai curve berdasarkan tekanan suction & discharge jika ada
        if (isset($validated['suction_press'], $validated['discharge_press'])) {
            $unitPosition = UnitPosition::find($unit_position_id);
            $unit = $unitPosition?->unit;
            $curveValue = Curve::interpolate(
                (float) $validated['suction_press'],
                (float) $validated['discharge_press'],
                $unit?->valve ?? '4/0'
            );
            $validated['curve'] = $curveValue;
            // curve_24h = curve + persentase tambahan dari setting unit
            $validated['curve_24h'] = $curveValue === null
                ? null
                : $curveValue * (100 + (float) ($unit?->curve_percentage ?? 0)) / 100;
            [$validated['performance'], $validated['performance_24h']] = $this->calculatePerformance(
                $unitPosition,
                $curveValue,
                $validated['curve_24h'],
                (float) ($validated['flowrate'] ?? 0)
            );
        }

        // Hitung jam sebelumnya
        $validatedTime = $validated['time'];
        $oneHourBefore = \Carbon\Carbon::createFromFormat('H:i', $validatedTime)
            ->subHour()
            ->format('H:i');

        // Cek status request
        // $statusRequest = StatusRequest::where('unit_position_id', $unit_position_id)
        //     ->where('start_date', $validated['date'])
        //     ->whereBetween('start_time', [$oneHourBefore, $validatedTime])
        //     ->first();

        // Cek warning dari input
        // Jika ada warning dari input, kirim notifikasi WhatsApp ke pekerja terkait unit
        // Frontend mengirim warning di dalam data.warn, bukan warn di level atas
        $warnings = collect($request->input('data.warn', []))->filter();
        if ($warnings->isNotEmpty()) {
            $unit = UnitPosition::with('unit')->findOrFail($unit_position_id);
            $warningMessage = "{$validated['date']},\n📍Unit: {$unit->unit->unit}:\n";

            foreach ($warnings as $field => $message) {
                $warningMessage .= "- " . ucfirst($field) . ": " . $message . "\n";
            }

            $workers = UserSetting::with('user')
                ->where('unit_position_id', $unit_position_id)
                ->get();
            // ->filter(fn($allocation) => $allocation->user?->role === 'technician' || $allocation->user?->role === 'operator');

            $numbers = $workers
                ->pluck('user.whatsAppNum')
                ->filter()
                ->implode(',');

            if (!empty($numbers)) {
                WhatsAppService::sendMessage($numbers, $warningMessage);
            }
        }
        try {
            // Simpan laporan harian baru, data field disimpan sebagai JSON
            $report = new DailyReport();
            $report->unit_position_id = $unit_position_id;
            $report->date = $validated['date'];
            $report->time = $validated['time'];
            // Model sudah cast 'data' ke array, jangan json_encode manual (double-encode)
            $report->data = $validated;
            // if ($statusRequest) {
            //     $report->request_id = $statusRequest->request_id;
            // }

            // Log::info('DEBUG', $report->toArray());
            $report->save();

            // Log::info('Report tersimpan:', $report->toArray());

            return response()->json(['type' => 'success', 'text' => 'Report berhasil disimpan.']);
        } catch (\Throwable $e) {
            Log::error('Gagal simpan report: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors('Gagal menyimpan report: ' . $e->getMessage());
        }
    }

    // Mengedit laporan harian yang sudah ada, atau membuat baru jika belum ada id
    public function editReport(Request $request)
    {
        $userRole = auth()->user()?->roleData?->name;
        if (!in_array($userRole, ['operator', 'super_admin', 'technician'])) {
            return response()->json(['type' => 'error', 'text' => 'You are not authorized to edit this report.'], 403);
        }

        $fieldsToNormalize = $request->fields ?? [];
        $data = $request->data ?? [];

        // 🧩 Normalisasi angka (ubah koma → titik)
        foreach ($fieldsToNormalize as $field) {
            if (isset($data[$field])) {
                $data[$field] = str_replace(',', '.', $data[$field]);
            }
        }

        // Gabungkan hasil normalisasi ke request->data
        $request->merge(['data' => $data]);

        // 🔍 Validasi dinamis (wajib/tidaknya tiap field ikut unit_fields.required)
        $unitIdForRules = UnitPosition::find($request->unit_position_id)?->unit_id;
        $requiredMap = $unitIdForRules ? $this->getRequiredFieldMap($unitIdForRules) : [];

        $rules = [];
        foreach ($fieldsToNormalize as $field) {
            if (in_array($field, ['date', 'time'])) {
                $rules["data.$field"] = 'required|string';
                continue;
            }
            $isRequired = $requiredMap[$field] ?? true;
            $rules["data.$field"] = ($isRequired ? 'required' : 'nullable') . '|numeric';
        }

        // id boleh kosong, karena bisa record baru
        if (!empty($data['id'])) {
            $rules["data.id"] = 'exists:daily_reports,id';
        }

        $validated = $request->validate($rules);
        $val = $validated['data'];

        // 🧠 Coba cari report berdasarkan id (kalau ada)
        $report = !empty($val['id']) ? DailyReport::find($val['id']) : null;
        Log::debug($request->unit_position_id);

        // Pastikan user memang ditugaskan ke unit yang mau diedit/dibuat
        $targetUnitPositionId = $report->unit_position_id ?? $request->unit_position_id;
        if (!$this->userCanAccessUnitPosition(auth()->user(), $targetUnitPositionId)) {
            return response()->json(['type' => 'error', 'text' => 'You are not assigned to this unit.'], 403);
        }

        // Hitung ulang curve jika data tekanan suction/discharge diubah
        if (isset($val['suction_press'], $val['discharge_press'])) {
            $unitPositionId = $report->unit_position_id ?? $request->unit_position_id;
            $unitPosition = UnitPosition::find($unitPositionId);
            $unit = $unitPosition?->unit;
            $curveValue = Curve::interpolate(
                (float) $val['suction_press'],
                (float) $val['discharge_press'],
                $unit?->valve ?? '4/0'
            );
            $val['curve'] = $curveValue;
            $val['curve_24h'] = $curveValue === null
                ? null
                : $curveValue * (100 + (float) ($unit?->curve_percentage ?? 0)) / 100;
            [$val['performance'], $val['performance_24h']] = $this->calculatePerformance(
                $unitPosition,
                $curveValue,
                $val['curve_24h'],
                (float) ($val['flowrate'] ?? 0)
            );
        }
        if ($report) {
            // 📝 Update data lama
            $report->update([
                'data' => $val,
                'time' => $val['time'],
                'date' => $val['date'],
            ]);
            $message = 'Report updated successfully';
        } else {
            // 🆕 Kalau belum ada, buat baru
            $report = DailyReport::create([
                'unit_position_id' => $request->unit_position_id,
                'date' => $val['date'],
                'time' => $val['time'],
                'data' => $val,
            ]);
            $message = 'Report created successfully';
        }

        return response()->json([
            'type' => 'success',
            'text' => $message,
            'report' => $report,
        ], 200);
    }

    // Menampilkan halaman detail laporan harian untuk sebuah unit berdasarkan nama
    public function index($unit_name)
    {
        $unitPosition = UnitPosition::whereHas('unit', function ($q) use ($unit_name) {
            $q->where('unit', $unit_name);
        })->first();

        if (!$unitPosition) {
            return redirect()->route('dashboard');
        }

        $unit_position_id = $unitPosition->id;

        // Catatan: hasil map di bawah tidak digunakan/disimpan (tidak berdampak pada response)
        DailyReport::with('request')->where('unit_position_id', $unit_position_id)->get()->map(function ($item) {
            return collect($item)->except([
                "created_at",
                "updated_at",
                "approval1",
                "approval2",
                "unit_position_id"
            ]);
        });

        return Inertia::render('Daily/Daily', [
            'unit_position_id' => $unit_position_id
        ]);
    }

    // Mengambil semua laporan harian (dengan beberapa kolom disembunyikan)
    public function getReport()
    {
        $data = DailyReport::all()
            ->map(function ($item) {
                return collect($item)->except([
                    "created_at",
                    "updated_at",
                    'remarks',
                    'request_id',
                    "id",
                    "unit_position_id"
                ]);
            });
        return response()->json($data);
    }


    // Mengambil laporan harian sebuah unit berdasarkan tanggal tertentu, terurut per jam
    public function getDataReportBasedOnDate(Request $request)
    {
        $data = DailyReport::with('request')
            ->where('unit_position_id', $request->unit_position_id)
            ->where('date', $request->date)
            ->orderBy('time')
            ->get()
            ->map(function ($item) {
                $decoded = $item->data;

                if (is_string($decoded)) {
                    $decoded = json_decode($decoded, true);
                }

                if (!is_array($decoded)) {
                    $decoded = [];
                }

                return array_merge($decoded, [
                    'unit_position_id' => $item->unit_position_id,
                    'id' => $item->id,
                    'date' => $item->date,
                    'time' => $item->time,
                    'request' => $item->request,
                ]);
            });


        return response()->json($data);
    }

    // Mengisi jam-jam laporan yang kosong (missing) dengan nilai 0 secara massal
    public function fillReport(Request $request)
    {
        Log::debug($request->all());
        $val = $request->validate([
            'missingHours' => 'required|array',
            'missingHours.*' => ['regex:/^(?:[01]\d|2[0-4]):00$/'],
            'unit_position_id' => 'required|exists:unit_positions,id',
            'date' => 'required|date'
        ]);


        $rows = [];

        // Field default (nilai 0) yang disimpan di dalam kolom JSON 'data'
        $defaultFields = [
            'sourcePress' => 0,
            'suctionPress' => 0,
            'dischargePress' => 0,
            'speed' => 0,
            'manifoldPress' => 0,
            'oilPress' => 0,
            'oilDiff' => 0,
            'runningHours' => 0,
            'voltage' => 0,
            'waterTemp' => 0,
            'befCooler' => 0,
            'aftCooler' => 0,
            'staticPress' => 0,
            'diffPress' => 0,
            'mscfd' => 0,
        ];

        // Bangun baris data default (nilai 0) untuk setiap jam yang hilang
        // Tabel daily_reports cuma punya kolom 'data' (JSON), bukan kolom per-field,
        // dan insert() ini raw query builder (bukan lewat Eloquent) sehingga cast
        // 'array' di model tidak berlaku otomatis -- harus json_encode manual di sini.
        foreach ($val['missingHours'] as $time) {
            $rows[] = [
                'unit_position_id' => $val['unit_position_id'],
                'date' => $val['date'],
                'time' => $time,
                'data' => json_encode(array_merge($defaultFields, [
                    'date' => $val['date'],
                    'time' => $time,
                ])),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert semua baris sekaligus (bulk insert)
        DailyReport::insert($rows);

        return response()->json($rows);
    }

}
