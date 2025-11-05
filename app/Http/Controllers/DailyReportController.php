<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use App\Models\StatusRequest;
use App\Models\TableCell;
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

        $reports = TableCell::with('report')
            ->whereHas('report', function ($q) use ($start, $end) {
                $q->whereDate('date', '>=', $start)
                    ->whereDate('date', '<=', $end);
            })
            ->orderBy('daily_report_id')
            ->get();
            
        $reportFormat = $reports->map(function ($item) {
            return [
                'date' => $item->report->date, // hanya ambil date dari report
                'time' => $item->report->time, // hanya ambil date dari report
                // ambil semua kolom TableCell
                ...$item->toArray(),
            ];
        });

        return response()->json($reportFormat);
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
    public $fields = [
        ['param' => 'sourcePress', 'cell' => 'B'],
        ['param' => 'dischargePress', 'cell' => 'C'],
        ['param' => 'suctionPress', 'cell' => 'D'],
        ['param' => 'speed', 'cell' => 'E'],
        ['param' => 'manifoldPress', 'cell' => 'F'],
        ['param' => 'oilPress', 'cell' => 'G'],
        ['param' => 'oilDiff', 'cell' => 'H'],
        ['param' => 'runningHours', 'cell' => 'I'],
        ['param' => 'voltage', 'cell' => 'J'],
        ['param' => 'waterTemp', 'cell' => 'K'],
        ['param' => 'befCooler', 'cell' => 'L'],
        ['param' => 'aftCooler', 'cell' => 'M'],
        ['param' => 'staticPress', 'cell' => 'N'],
        ['param' => 'diffPress', 'cell' => 'O'],
        ['param' => 'mscfd', 'cell' => 'P'],
        ['param' => 'remarks', 'cell' => 'Q']
    ];

    public function setCells($reportData)
    {
        $cellsData = [];

        foreach ($this->fields as $field) {
            $param = $field['param'];
            $cell = $field['cell']; // selalu ambil dari fields
            $value = $reportData[$param] ?? 0; // kalau $reportData array, pakai ini. Kalau model, pakai $reportData->$param

            $cellsData[] = [
                'daily_report_id' => $reportData['id'] ?? $reportData->id,
                'parameter' => $param,
                'value' => $value,
                'cell' => $cell,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($cellsData)) {
            TableCell::upsert(
                $cellsData,
                ['daily_report_id', 'parameter'], // key unik untuk cek apakah update atau insert
                ['value', 'cell', 'updated_at']   // fields yang diupdate kalau record sudah ada
            );
        }
    }



    public function setReport(Request $request, $unit_position_id)
    {
        Log::debug('CSRF Token', ['header' => $request->header('X-CSRF-TOKEN')]);
        Log::debug('Session', $request->session()->all());
        if (!$unit_position_id) {
            return response()->json(['type' => 'error', 'text' => 'Unit position ID tidak ditemukan.']);
        }

        $fieldsToNormalize = $request->fields ?? [];
        $data = $request->data ?? [];

        // 🔧 Normalisasi angka (ganti koma ke titik)
        foreach ($fieldsToNormalize as $field) {
            if (isset($data[$field])) {
                $data[$field] = str_replace(',', '.', $data[$field]);
            }
        }

        // Gabungkan hasil normalisasi ke request->data
        $request->merge(['data' => $data]);

        // 🔍 Buat rules validasi dinamis
        $rules = [];
        foreach ($fieldsToNormalize as $field) {
            $rules["data.$field"] = in_array($field, ['date', 'time'])
                ? 'required|string'
                : 'required|numeric';
        }

        $validatedData = $request->validate($rules);
        $validated = $validatedData['data']; // 🎯 langsung ambil bagian data

        // Hitung jam sebelumnya
        $validatedTime = $validated['time'];
        $oneHourBefore = \Carbon\Carbon::createFromFormat('H:i', $validatedTime)
            ->subHour()
            ->format('H:i');

        // Cek status request
        $statusRequest = StatusRequest::where('unit_position_id', $unit_position_id)
            ->where('start_date', $validated['date'])
            ->whereBetween('start_time', [$oneHourBefore, $validatedTime])
            ->first();

        Log::debug('status ' . $statusRequest);

        // 🚨 Cek warning dari input
        $warnings = collect($request->input('warn', []))->filter();
        if ($warnings->isNotEmpty()) {
            $unit = UnitPosition::with('unit')->findOrFail($unit_position_id);
            $warningMessage = "{$validated['date']},\n📍Unit: {$unit->unit->unit}:\n";

            foreach ($warnings as $field => $message) {
                $warningMessage .= "- " . ucfirst($field) . ": " . $message . "\n";
            }

            $technicians = UserSetting::with('user')
                ->where('unit_position_id', $unit_position_id)
                ->get()
                ->filter(fn($allocation) => $allocation->user?->role === 'technician');

            $numbers = $technicians
                ->pluck('user.whatsAppNum')
                ->filter()
                ->implode(',');

            if (!empty($numbers)) {
                WhatsAppService::sendMessage($numbers, $warningMessage);
            }
            WhatsAppService::sendMessage('082113837546', $warningMessage);
        }
        try {
            $report = new DailyReport();
            $report->unit_position_id = $unit_position_id;
            $report->date = $validated['date'];
            $report->time = $validated['time'];
            $report->data = json_encode($validated);
            if ($statusRequest) {
                $report->request_id = $statusRequest->request_id;
            }

            Log::info('DEBUG', $report->toArray());
            $report->save();

            Log::info('Report tersimpan:', $report->toArray());

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
                // Decode JSON data
                $decoded = json_decode($item->data, true) ?? [];

                // Gabungkan semua field di data + tambahkan request
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

