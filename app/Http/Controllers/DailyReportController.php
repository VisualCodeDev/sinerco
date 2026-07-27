<?php

namespace App\Http\Controllers;

use App\Models\Curve;
use App\Models\DailyReport;
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

        $fields = UnitField::with('fields.subfields')
            ->where('unit_id', $unit_id)
            ->get()
            ->map(function ($item) use ($unitData) {
                $field = $item->fields;
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
            ->filter(function ($field) {
                return $field['visible'] || $field['subfields']->isNotEmpty();
            })
            ->values();

        $reports = DailyReport::where('unit_position_id', $unit_position_id)
            ->whereBetween('date', [$start, $end])
            ->with('request')
            ->get()
            ->map(function ($item) {
                $data = $item->data;

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

    public function setReport(Request $request, $unit_position_id)
    {
        if (!$unit_position_id) {
            return response()->json(['type' => 'error', 'text' => 'Unit position ID tidak ditemukan.']);
        }

        $fieldsToNormalize = $request->fields ?? [];
        $data = $request->data ?? [];

        foreach ($fieldsToNormalize as $field) {
            if (isset($data[$field])) {
                $data[$field] = str_replace(',', '.', $data[$field]);
            }
        }

        $request->merge(['data' => $data]);

        $rules = [];
        foreach ($fieldsToNormalize as $field) {
            $rules["data.$field"] = in_array($field, ['date', 'time'])
                ? 'required|string'
                : 'required|numeric';
        }

        $validatedData = $request->validate($rules);
        $validated = $validatedData['data'];

        if (isset($validated['suction_press'], $validated['discharge_press'])) {
            $unit = UnitPosition::find($unit_position_id)?->unit;
            $curveValue = Curve::interpolate(
                (float) $validated['suction_press'],
                (float) $validated['discharge_press'],
                $unit?->valve ?? '4/0'
            );
            $validated['curve_24h'] = $curveValue === null
                ? null
                : $curveValue * (100 + (float) ($unit?->curve_percentage ?? 0)) / 100;
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
        $warnings = collect($request->input('warn', []))->filter();
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
            // WhatsAppService::sendMessage('081281995158', $warningMessage);
        }
        try {
            $report = new DailyReport();
            $report->unit_position_id = $unit_position_id;
            $report->date = $validated['date'];
            $report->time = $validated['time'];
            $report->data = json_encode($validated);
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

    public function editReport(Request $request)
    {
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

        // 🔍 Validasi dinamis
        $rules = [];
        foreach ($fieldsToNormalize as $field) {
            $rules["data.$field"] = in_array($field, ['date', 'time'])
                ? 'required|string'
                : 'required|numeric';
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

        if (isset($val['suction_press'], $val['discharge_press'])) {
            $unitPositionId = $report->unit_position_id ?? $request->unit_position_id;
            $unit = UnitPosition::find($unitPositionId)?->unit;
            $curveValue = Curve::interpolate(
                (float) $val['suction_press'],
                (float) $val['discharge_press'],
                $unit?->valve ?? '4/0'
            );
            $val['curve_24h'] = $curveValue === null
                ? null
                : $curveValue * (100 + (float) ($unit?->curve_percentage ?? 0)) / 100;
        }
        if ($report) {
            // 📝 Update data lama
            $report->update([
                'data' => json_encode($val),
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
                'data' => json_encode($val),
            ]);
            $message = 'Report created successfully';
        }

        return response()->json([
            'type' => 'success',
            'text' => $message,
            'report' => $report,
        ], 200);
    }

    public function index($unit_position_id)
    {
        DailyReport::with('request')->where('unit_position_id', $unit_position_id)->get()->map(function ($item) {
            return collect($item)->except([
                "created_at",
                "updated_at",
                "approval1",
                "approval2",
                "unit_position_id"
            ]);
        });
        if ($unit_position_id) {
            $unitData = UnitPosition::find($unit_position_id)->with(['client', 'unit', 'dailyReportSetting'])->first();
            return Inertia::render('Daily/Daily', [
                'unit_position_id' => $unit_position_id
            ]);
        }
        return redirect()->route('dashboard');
    }

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

        foreach ($val['missingHours'] as $time) {
            $rows[] = [
                'unit_position_id' => $val['unit_position_id'],
                'date' => $val['date'],
                'time' => $time,
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
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DailyReport::insert($rows);

        return response()->json($rows);
    }

}

