<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\Client;
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

    // ADD NEW UNIT

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

    public function addNewUnit(Request $request)
    {
        $val = $request->validate([
            'unit' => 'required',
            'status' => 'required',

            'position_type' => 'required|in:client,workshop',

            // Either existing or new Client
            'client_id' => 'nullable|exists:clients,client_id',
            'client_name' => 'nullable|required_if:position_type,client|string',

            // Either existing or new Workshop
            'workshop_id' => 'nullable|exists:workshops,workshop_id',
            'workshop_name' => 'nullable|required_if:position_type,workshop|string',

            // Either existing or new Area
            'area_id' => 'nullable|exists:areas,id',
            'area_name' => 'nullable|string',

            // Either existing or new Location
            'location_id' => 'nullable|exists:locations,id',
            'location_name' => 'nullable|string',
        ]);

        DB::transaction(function () use ($val) {

            $areaId = null;
            $locationId = null;
            
            // 1. Handle Area
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
            $unit = DataUnit::create([
                'unit' => $val['unit'],
                'status' => $val['status'],
            ]);

            $clientId = null;
            $workshopId = null;

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

            $unit->UnitPositions()->create([
                'client_id' => $val['client_id'],
                'location_id' => $locationId,
                'workshop_id' => $workshopId,
                'position_type' => $val['position_type'],
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
