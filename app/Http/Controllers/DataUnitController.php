<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\UnitPosition;
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
            $temp = $user->UnitPositions()->with([
                'unit' => function ($q) {
                    $q->select(['unit_id', 'unit', 'status']);
                },
                'client' => function ($q) {
                    $q->select(['client_id', 'name']);
                },
                'location.area'
            ])->get()->makeHidden(['created_at', 'updated_at']);
            $data = $temp->map(function ($pos) {
                return [
                    'unit_id' => $pos->unit->unit_id,
                    'unit' => $pos->unit->unit,
                    'status' => $pos->unit->status,
                    'client' => $pos->client?->name,
                    'location' => $pos->location?->location,
                    'location_id' => $pos->location_id,
                    'area' => $pos->location?->area?->area,
                    'unit_position_id' => $pos->id,
                ];
            });
        } else {
            $temp = DataUnit::with([
                'UnitPositions.client' => function ($q) {
                    $q->select(['client_id', 'name']);
                },
                'UnitPositions.location.area'
            ])->select(['unit_id', 'unit', 'status'])->get();

            $data = $temp->map(function ($unit) {
                return [
                    'unit_id' => $unit->unit_id,
                    'unit' => $unit->unit,
                    'status' => $unit->status,
                    'client' => $unit->UnitPositions?->client->name,
                    'location_id' => $unit->location_id,
                    'location' => $unit->UnitPositions?->location->location,
                    'area' => $unit->UnitPositions?->location->area->area,
                    'unit_position_id' => $unit->UnitPositions?->id,
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
            'data' => $units->values(),
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
        DataUnit::whereIn('unit_id', $val['selected'])
            ->update(['input_interval' => $val['input_interval']]);

        return response()->json(['type' => 'success', 'text' => 'Input Interval updated!']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function getSelectedUnit(Request $request)
    {
        $unit = UnitPosition::with(['client', 'unit', 'dailyReportSetting', 'location.area'])
            ->where('id', $request->unit_position_id)->first();

        $data = [
            'unit_id' => $unit->unit_id ?? null,
            'daily_report_setting' => $unit->dailyReportSetting ?? null,
            'unit' => $unit->unit->unit ?? null,
            'status' => $unit->unit->status ?? null,
            'client' => $unit->client?->name ?? null,
            'input_interval' => $unit->client?->input_interval ?? null,
            'input_duration' => $unit->client?->input_duration ?? null,
            'location' => $unit->location?->location ?? null,
            'area' => $unit->location?->area?->area ?? null,
            'unit_position_id' => $unit->id ?? null,
        ];


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

        $data = collect($val['unit_ids'])->map(function ($unit_id) use ($val) {
            return [
                'unit_id' => $unit_id,
                'workshop_id' => $val['workshop_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        DB::table('workshop_units')->insertOrIgnore($data);

        return response()->json(['type' => 'success', 'text' => 'Units added successfully']);
    }

}
