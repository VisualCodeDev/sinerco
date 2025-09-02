<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\UnitAreaLocation;
use App\Models\Workshop;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Log;

class DataUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public static function getPermittedUnit()
    {
        $user = Auth::user()->load('roleData');
        if ($user->roleData->name == 'technician' || $user->roleData->name == 'operator') {
            $data = $user->unitAreaLocations()->with([
                'unit' => function ($q) {
                    $q->select(['unitId', 'unit', 'status']);
                },
                'client' => function ($q) {
                    $q->select(['clientId', 'name']);
                },
                'location.area'
            ])->get()->makeHidden(['created_at', 'updated_at']);
        } else {
            $temp = DataUnit::with([
                'unitAreaLocations.client' => function ($q) {
                    $q->select(['clientId', 'name']);
                },
                'unitAreaLocations.location.area'
            ])->select(['unitId', 'unit', 'status'])->get();

            $data = $temp->map(function ($unit) {
                return [
                    'unitId' => $unit->unitId,
                    'unit' => $unit->unit,
                    'status' => $unit->status,
                    'client' => $unit->unitAreaLocations?->client->name,
                    'location' => $unit->unitAreaLocations?->location->location,
                    'area' => $unit->unitAreaLocations?->location->area->area,
                    'unitAreaLocationId' => $unit->unitAreaLocations?->unitAreaLocationId,
                ];
            });
        }
        return $data;
    }

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

    public function unitList(Request $request)
    {
        $status = $request->query('status');

        $units = self::getPermittedUnit();

        if ($status) {
            $units = $units->filter(function ($item) use ($status) {
                return optional($item->unit)->status === $status;
            });
        }

        return Inertia::render('Daily/DailyList', [
            'data' => $units->values(), // reset index
            'filters' => [
                'status' => $status,
            ],
        ]);
    }
    public function getUnit()
    {
        $data = $this->getPermittedUnit();

        return response()->json($data);
    }

    public function getUnitStatus()
    {
        $data = $this->getPermittedUnit()->map(function ($item) {
            return $item;
        });
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function unitSetting(Request $request)
    {
        return Inertia::render('Unit/UnitSetting');
    }

    /**
     * Display the specified resource.
     */
    public function setInterval(Request $request)
    {
        $val = $request->validate([
            'selected' => 'required|array',
            'input_interval' => 'required|integer|between:1,24',
        ]);

        // Update all matching DataUnit records
        DataUnit::whereIn('unitId', $val['selected'])
            ->update(['input_interval' => $val['input_interval']]);

        return response()->json(['type' => 'success', 'text' => 'Input Interval updated!']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function getSelectedUnit(Request $request)
    {
        $data = UnitAreaLocation::where('unitAreaLocationId', $request->unitAreaLocationId)->with(['client', 'unit', 'dailyReportSetting', 'location.area'])->first();
        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function unitLocation()
    {
        return Inertia::render('Unit/UnitLocationSetting');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function addUnitLocation(Request $request)
    {
        $val = $request->validate([
            'workshop_id' => 'required',
            'unit_ids' => 'required|array'
        ]);

        $data = collect($val['unit_ids'])->map(function ($unitId) use ($val) {
            return [
                'unit_id' => $unitId,
                'workshop_id' => $val['workshop_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        DB::table('workshop_units')->insertOrIgnore($data);

        return response()->json(['type' => 'success', 'text' => 'Units added successfully']);
    }

}
