<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use App\Models\StatusRequest;
use App\Models\UnitPosition;
use App\Models\UserSetting;
use App\Services\WhatsAppService;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class DailyReportController extends Controller
{
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
        if ($unit_position_id) {
            $fieldsToNormalize = [
                'sourcePress',
                'suctionPress',
                'dischargePress',
                'speed',
                'manifoldPress',
                'oilPress',
                'oilDiff',
                'runningHours',
                'voltage',
                'waterTemp',
                'befCooler',
                'aftCooler',
                'staticPress',
                'diffPress',
                'mscfd'
            ];

            foreach ($fieldsToNormalize as $field) {
                if ($request->has($field)) {
                    $request->merge([
                        $field => str_replace(',', '.', $request->input($field))
                    ]);
                }
            }

            $validatedData = $request->validate([
                'date' => 'required|string',
                'time' => 'required|string',
                'sourcePress' => 'required|numeric',
                'suctionPress' => 'required|numeric',
                'dischargePress' => 'required|numeric',
                'speed' => 'required|numeric',
                'manifoldPress' => 'required|numeric',
                'oilPress' => 'required|numeric',
                'oilDiff' => 'required|numeric',
                'runningHours' => 'required|numeric',
                'voltage' => 'required|numeric',
                'waterTemp' => 'required|numeric',
                'befCooler' => 'required|numeric',
                'aftCooler' => 'required|numeric',
                'staticPress' => 'required|numeric',
                'diffPress' => 'required|numeric',
                'mscfd' => 'required|numeric',
            ]);

            $validatedTime = $validatedData['time'];
            $oneHourBefore = \Carbon\Carbon::createFromFormat('H:i', $validatedTime)
                ->subHour()
                ->format('H:i');

            $statusRequest = StatusRequest::where('unit_position_id', $unit_position_id)
                ->where('start_date', $validatedData['date'])
                ->whereBetween('start_time', [$oneHourBefore, $validatedTime])
                ->first();

            Log::debug('status ' . $statusRequest);

            if ($validatedData) {
                $data = collect($validatedData)
                    ->mapWithKeys(function ($field, $key) {
                        return is_array($field) && isset($field['value'])
                            ? [$key => $field['value']]
                            : [$key => $field];
                    })
                    ->toArray();
                $originalInput = $request->all();

                $warnings = collect($originalInput['warn'] ?? [])->filter(function ($message) {
                    return !empty($message);
                });
                if ($warnings->isNotEmpty()) {
                    $unit = UnitPosition::with('unit')->findOrFail($unit_position_id);
                    $warningMessage = "{$data['date']},\n📍Unit: {$unit->unit->unit}:\n";

                    foreach ($warnings as $field => $message) {
                        $warningMessage .= "- " . ucfirst($field) . ": " . $message . "\n";
                    }
                    $technicians = UserSetting::with('user')
                        ->where('unit_position_id', $unit_position_id)
                        ->get()
                        ->filter(fn($allocation) => $allocation->user?->role === 'technician');


                    $numbers = $technicians
                        ->filter(fn($tech) => !empty($tech->user->whatsAppNum))
                        ->map(fn($tech) => $tech->user->whatsAppNum)
                        ->implode(',');

                    Log::debug("NOMOR TELP" . $numbers);

                    if (!empty($numbers)) {
                        WhatsAppService::sendMessage($numbers, $warningMessage);
                    }
                    WhatsAppService::sendMessage('082113837546', $warningMessage);
                }


                $report = new DailyReport();
                $report->unit_position_id = $unit_position_id;
                $report->date = $data['date'];
                $report->time = $data['time'];
                $report->sourcePress = $data['sourcePress'];
                $report->suctionPress = $data['suctionPress'];
                $report->dischargePress = $data['dischargePress'];
                $report->speed = $data['speed'];
                $report->manifoldPress = $data['manifoldPress'];
                $report->oilPress = $data['oilPress'];
                $report->oilDiff = $data['oilDiff'];
                $report->runningHours = $data['runningHours'];
                $report->voltage = $data['voltage'];
                $report->waterTemp = $data['waterTemp'];
                $report->befCooler = $data['befCooler'];
                $report->aftCooler = $data['aftCooler'];
                $report->staticPress = $data['staticPress'];
                $report->diffPress = $data['diffPress'];
                $report->mscfd = $data['mscfd'];

                if ($statusRequest) {
                    $report->request_id = $statusRequest->request_id;
                }
                $report->save();
                // $report->unit_position_id = $unit_position_id;
                // $report->fill($data)->save();
            }

        }
        // if ($report->speed > 0) {
        //     WhatsAppService::sendMessage('082113837546, 081359113349', 'Speed Input at ' . $report->date . ' is ' . $report->speed);
        // }
        return back();
    }

    public function editReport(Request $request)
    {
        $val = $request->validate([
            'id' => 'required|exists:daily_reports,id',
            'date' => 'required|string',
            'time' => 'required|string',
            'sourcePress' => 'required|numeric',
            'suctionPress' => 'required|numeric',
            'dischargePress' => 'required|numeric',
            'speed' => 'required|numeric',
            'manifoldPress' => 'required|numeric',
            'oilPress' => 'required|numeric',
            'oilDiff' => 'required|numeric',
            'runningHours' => 'required|numeric',
            'voltage' => 'required|numeric',
            'waterTemp' => 'required|numeric',
            'befCooler' => 'required|numeric',
            'aftCooler' => 'required|numeric',
            'staticPress' => 'required|numeric',
            'diffPress' => 'required|numeric',
            'mscfd' => 'required|numeric',
        ]);
        if (!$val) {
            return response()->json(['type' => 'error', 'text' => 'Validation failed'], 422);
        }
        $report = DailyReport::find($request->id);
        $report->update($request->all());

        return response()->json(['type' => 'success', 'text' => 'Report updated successfully'], 200);
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
        $data = DailyReport::with('request')->where('unit_position_id', $request->unit_position_id)
            ->where('date', $request->date)->orderBy('time')->get()->map(function ($item) {
                return collect($item)->except([
                    "created_at",
                    "updated_at",
                    "approval1",
                    "approval2",
                    "unit_position_id"
                ]);
            });
        return response()->json($data);
    }

    public function fillReport(Request $request)
    {
        $val = $request->validate([
            'missingHours' => 'required|array',
            'missingHours.*' => ['regex:/^(?:[01]\d|2[0-3]):00$/'],
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

