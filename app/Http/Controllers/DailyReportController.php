<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use App\Models\UnitAreaLocation;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyReportController extends Controller
{
    public function dailyList()
    {
        $data = UnitAreaLocation::with([
            'unit' => function ($q) {
                $q->select(['unitId', 'unit']);
            },
            'user' => function ($q) {
                $q->select(['userDataUnitId', 'user']);
            }
        ])->get()->makeHidden(['created_at', 'updated_at']);

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

            $report = new DailyReport();
            $report->unitAreaLocationId = $unitAreaLocationId;
            $report->date = $validatedData['date'];
            $report->time = $validatedData['time'];
            $report->sourcePress = $validatedData['sourcePress'];
            $report->suctionPress = $validatedData['suctionPress'];
            $report->dischargePress = $validatedData['dischargePress'];
            $report->speed = $validatedData['speed'];
            $report->manifoldPress = $validatedData['manifoldPress'];
            $report->oilPress = $validatedData['oilPress'];
            $report->oilDiff = $validatedData['oilDiff'];
            $report->runningHours = $validatedData['runningHours'];
            $report->voltage = $validatedData['voltage'];
            $report->waterTemp = $validatedData['waterTemp'];
            $report->befCooler = $validatedData['befCooler'];
            $report->aftCooler = $validatedData['aftCooler'];
            $report->staticPress = $validatedData['staticPress'];
            $report->diffPress = $validatedData['diffPress'];
            $report->mscfd = $validatedData['mscfd'];
            $report->save();
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
                "id",
                "unitAreaLocationId"
            ]);
        });
        if ($unitAreaLocationId) {
            $unitData = UnitAreaLocation::where('unitAreaLocationId', $unitAreaLocationId)->with(['user', 'unit', 'dailyReportSetting'])->first();
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

