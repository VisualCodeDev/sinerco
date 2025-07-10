<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\UnitAreaLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DataUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public static function getPermittedUnit()
    {
        $user = Auth::user();
        if ($user->role == 'technician' || $user->role == 'operator') {
            $data = $user->unitAreaLocations()->with([
                'unit' => function ($q) {
                    $q->select(['unitId', 'unit', 'status']);
                },
                'client' => function ($q) {
                    $q->select(['clientId', 'name']);
                }
            ])->get()->makeHidden(['created_at', 'updated_at']);
        } else {
            $data = UnitAreaLocation::with([
                'unit' => function ($q) {
                    $q->select(['unitId', 'unit', 'status']);
                },
                'client' => function ($q) {
                    $q->select(['clientId', 'name']);
                }
            ])->get()->makeHidden(['created_at', 'updated_at']);
        }
        return $data;
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

    /**
     * Show the form for creating a new resource.
     */
    public function getUnitStatus()
    {
        $data = $this->getPermittedUnit()->map(function ($item) {
            return $item->unit;
        });
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(DataUnit $dataUnit)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DataUnit $dataUnit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DataUnit $dataUnit)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DataUnit $dataUnit)
    {
        //
    }
}
