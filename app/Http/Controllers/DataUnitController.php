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
                    $q->select(['client_id', 'name', 'gmt_offset']);
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
                    'gmt_offset' => $pos->client?->gmt_offset ?? $pos->workshop?->gmt_offset ?? 7,
                    'location' => $pos->location?->location ?? null,
                    'location_id' => $pos->location_id ?? null,
                    'area' => $pos->location?->area?->area ?? null,
                    'unit_position_id' => $pos->id,
                ];
            });
        } else {
            $temp = DataUnit::with([
                'UnitPositions.client' => function ($q) {
                    $q->select(['client_id', 'name', 'gmt_offset']);
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
                    'gmt_offset' => $unit->UnitPositions?->client?->gmt_offset ?? $unit->UnitPositions?->workshop?->gmt_offset ?? 7,
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
        $unit = UnitPosition::with(['client', 'unit', 'dailyReportSetting', 'location.area', 'workshop'])
            ->where('id', $request->unit_position_id)->first();

        $data = [
            'unit_id' => $unit->unit_id ?? null,
            'daily_report_setting' => $unit->dailyReportSetting ?? null,
            'unit' => $unit->unit->unit ?? null,
            'status' => $unit->unit->status ?? null,
            'client' => $unit->client?->name ?? $unit->workshop?->name ?? null,
            'input_interval' => $unit->client?->input_interval ?? null,
            'input_duration' => $unit->client?->input_duration ?? null,
            'gmt_offset' => $unit->client?->gmt_offset ?? null,
            'disable_duration' => (bool) $unit->client?->disable_duration ?? false,
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
        $rules = [
            'unit' => 'required|string',
            'status' => 'required|string',
            'position_type' => 'required|in:client,workshop',
            'area_id' => 'nullable|exists:areas,id',
            'area_name' => 'nullable|string',
            'location_id' => 'nullable|exists:locations,id',
            'location_name' => 'nullable|string',
        ];

        if ($request->position_type === 'client') {
            $rules['client_id'] = 'nullable|exists:clients,client_id';
            $rules['client_name'] = 'nullable|string';
        } elseif ($request->position_type === 'workshop') {
            $rules['workshop_id'] = 'nullable|exists:workshops,workshop_id';
            $rules['workshop_name'] = 'nullable|string';
        }

        $val = $request->validate($rules);

        if ($request->position_type === 'client' && !$request->client_id && !$request->client_name) {
            return response()->json([
                'errors' => ['client' => ['Either client_id or client_name is required.']]
            ], 422);
        }

        if ($request->position_type === 'workshop' && !$request->workshop_id && !$request->workshop_name) {
            return response()->json([
                'errors' => ['workshop' => ['Either workshop_id or workshop_name is required.']]
            ], 422);
        }

        DB::transaction(function () use ($val) {

            $areaId = null;
            $locationId = null;

            // 1. Handle Area
            // if ($val['position_type'] === 'client') {
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
            // }

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
                'client_id' => $clientId,
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


    public function updateUnitInfo(Request $request)
    {
        $val = $request->validate([
            "unit_id" => "required|exists:data_units,unit_id",
            "name" => "required|string"
        ]);

        DataUnit::where("unit_id", $val["unit_id"])
            ->update([
                "unit" => $val["name"]
            ]);

        return response()->json([
            "type" => "success",
            "text" => "Unit Updated"
        ]);
    }

}
