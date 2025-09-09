<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\DataUnit;
use App\Models\Location;
use App\Models\Area;
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
                'workshop' => function ($q) {
                    $q->select(['workshop_id', 'name']);
                },
                'location.area'
            ])->get()->makeHidden(['created_at', 'updated_at']);
            $data = $temp->map(function ($pos) {
                return [
                    'unit_id' => $pos->unit->unit_id,
                    'unit' => $pos->unit->unit,
                    'status' => $pos->unit->status,
                    'client' => $pos->client?->name ?? $pos->workshop?->name,
                    'location' => $pos->location?->location ?? null,
                    'location_id' => $pos->location_id ?? null,
                    'area' => $pos->location?->area?->area ?? null,
                    'unit_position_id' => $pos->id,
                ];
            });
        } else {
            $temp = DataUnit::with([
                'UnitPositions.client' => function ($q) {
                    $q->select(['client_id', 'name']);
                },
                'UnitPositions.location.area',
                'UnitPositions.workshop' => function ($q) {
                    $q->select(['workshop_id', 'name']);
                },
            ])->select(['unit_id', 'unit', 'status'])->get();

            $data = $temp->map(function ($unit) {
                return [
                    'unit_id' => $unit->unit_id,
                    'unit' => $unit->unit,
                    'status' => $unit->status,
                    'client' => $unit->UnitPositions?->client->name ?? $unit->UnitPositions?->workshop->name,
                    'location_id' => $unit->location_id,
                    'location' => $unit->UnitPositions?->location->location ?? null,
                    'area' => $unit->UnitPositions?->location->area->area ?? null,
                    'unit_position_id' => $unit->UnitPositions?->id ?? null,
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

    // ADD NEW UNIT

    public function create()
    {
        $clients = Client::all();
        $locations = Location::all();
        $areas = Area::all();

        return inertia('Unit/UnitAddNew', [
            'clients' => $clients,
            'locations' => $locations,
            'areas' => $areas,
        ]);
    }

    public function addNewUnit(Request $request)
    {
        $val = $request->validate([
            'unit' => 'required',
            'status' => 'required',
            'client_id' => 'nullable|exists:clients,client_id',

            // Either existing or new Area
            'area_id' => 'nullable|exists:areas,id',
            'area_name' => 'nullable|string',

            // Either existing or new Location
            'location_id' => 'nullable|exists:locations,id',
            'location_name' => 'nullable|string',
        ]);

        DB::transaction(function () use ($val) {
            // 1. Handle Area
            if (!empty($val['area_id'])) {
                $areaId = $val['area_id'];
            } else {
                $area = Area::create([
                    'area' => $val['area_name'],
                ]);
                $areaId = $area->id;
            }

            // 2. Handle Location
            if (!empty($val['location_id'])) {
                $locationId = $val['location_id'];
            } else {
                $location = Location::create([
                    'area_id' => $areaId,
                    'location' => $val['location_name'],
                ]);
                $locationId = $location->id;
            }

            // 3. Create Unit
            $unit = DataUnit::create([
                'unit' => $val['unit'],
                'status' => $val['status'],
            ]);

            // 4. Attach Unit → Position
            $unit->UnitPositions()->create([
                'client_id' => $val['client_id'],
                'location_id' => $locationId,
                'position_type' => 'client',
            ]);

            return $unit;
        });

        return response()->json(['type' => 'success', 'text' => 'Unit added successfully']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function unitLocation()
    {
        return Inertia::render('Unit/Positions');
    }

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
        UnitPosition::whereIn('unit_id', $val['unit_ids'])
            ->update([
                'workshop_id' => $workshopId,
                'client_id' => $clientId,
                'position_type' => $workshopId ? 'workshop' : 'client',
                'updated_at' => now(),
            ]);

        return response()->json([
            'type' => 'success',
            'text' => 'Units added successfully',
            // 'inserted' => count($newData),
            // 'skipped' => count($existing),
        ]);
    }

}
