<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use App\Models\UnitAreaLocation;
use App\Models\UserAllocation;
use App\Services\WhatsAppService;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class DailyReportController extends Controller
{
    public function unitList()
    {
        $user = Auth::user();
        // dd($user->role);
        if ($user->role == 'technician' || $user->role == 'operator') {
            $data = $user->unitAreaLocations()->with([
                'unit' => function ($q) {
                    $q->select(['unitId', 'unit']);
                },
                'client' => function ($q) {
                    $q->select(['clientId', 'name']);
                }
            ])->get()->makeHidden(['created_at', 'updated_at']);
        } else {
            $data = UnitAreaLocation::with([
                'unit' => function ($q) {
                    $q->select(['unitId', 'unit']);
                },
                'client' => function ($q) {
                    $q->select(['clientId', 'name']);
                }
            ])->get()->makeHidden(['created_at', 'updated_at']);
        }
        ;

        return Inertia::render('Daily/DailyList', ['data' => $data]);
    }
    public function setReport(Request $request, $unitAreaLocationId)
    {
        if ($unitAreaLocationId) {
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
                    $unit = UnitAreaLocation::where('unitAreaLocationId', $unitAreaLocationId)->first()->load('unit');
                    $warningMessage = "⚠️ Input Warning Detected on \nDate: {$data['date']},\n📍Unit: {$unit->unit->unit}:\n";

                    foreach ($warnings as $field => $message) {
                        $warningMessage .= "- " . ucfirst($field) . ": " . $message . "\n";
                    }
                    $technicians = UserAllocation::with('user')
                        ->where('unitAreaLocationId', $unitAreaLocationId)
                        ->get()
                        ->filter(fn($allocation) => $allocation->user?->role === 'technician');


                    $numbers = $technicians
                        ->filter(fn($tech) => !empty($tech->user->whatsAppNum))
                        ->map(fn($tech) => $tech->user->whatsAppNum)
                        ->implode(',');

                    if (!empty($numbers)) {
                        WhatsAppService::sendMessage($numbers, $warningMessage);
                    }
                }

                $report = new DailyReport();
                $report->unitAreaLocationId = $unitAreaLocationId;
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
                $report->save();
                // $report->unitAreaLocationId = $unitAreaLocationId;
                // $report->fill($data)->save();
            }

        }
        // if ($report->speed > 0) {
        //     WhatsAppService::sendMessage('082113837546, 081359113349', 'Speed Input at ' . $report->date . ' is ' . $report->speed);
        // }
        return back();
    }


    public function index($unitAreaLocationId)
    {
        $data = DailyReport::where('unitAreaLocationId', $unitAreaLocationId)->get()->map(function ($item) {
            return collect($item)->except([
                "created_at",
                "updated_at",
                "approval1",
                "approval2",
                "unitAreaLocationId"
            ]);
        });
        if ($unitAreaLocationId) {
            $unitData = UnitAreaLocation::where('unitAreaLocationId', $unitAreaLocationId)->with(['client', 'unit', 'dailyReportSetting'])->first();
            return Inertia::render('Daily/Daily', [
                'data' => $data,
                'unitData' => $unitData,
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
                    "approval1",
                    "approval2",
                    "id",
                    "unitAreaLocationId"
                ]);
            });
        return response()->json($data);
    }

}

