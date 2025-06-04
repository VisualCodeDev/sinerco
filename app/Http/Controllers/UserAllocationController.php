<?php

namespace App\Http\Controllers;

use App\Models\UnitAreaLocation;
use App\Models\User;
use App\Models\UserAllocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserAllocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $technicianData = User::where('role', 'technician')->get();
        $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('Setting/UserAllocation', ['technicianData' => $technicianData, 'operatorData' => $operatorData]);
    }
    public function allocationSettings($userId)
    {
        $userData = User::where('id', $userId)->first();
        $permittedData = UserAllocation::where('userId', $userId)->with('unitArea.client', 'unitArea.unit')->get()->toArray();

        $unitAreaData = [];
        $unitAreaData = UnitAreaLocation::with(['unit', 'client'])->get();
        // if ($userData->role == 'operator') {
        //     $unitAreaData = Client::all();
        // }
        ;
        return Inertia::render('Setting/UserAllocationSetting', ['data' => $userData, 'permittedData' => $permittedData, 'unitAreaData' => $unitAreaData]);
    }

    public function allocationSettingsAdd(Request $request)
    {
        $validate = $request->validate([
            'userId' => 'required|exists:users,id',
            'unitAreaLocationId' => 'required|array',
            'unitAreaLocationId.*' => 'exists:unit_area_locations,unitAreaLocationId',
        ]);
        $userId = $validate['userId'];
        $unitAreaLocationIds = $validate['unitAreaLocationId'];

        if (!is_array($unitAreaLocationIds)) {
            return response()->json(['isSuccess' => false], 400);
        }

        $added = [];
        $skipped = [];

        foreach ($unitAreaLocationIds as $unitId) {
            $exists = UserAllocation::where('userId', $userId)
                ->where('unitAreaLocationId', $unitId)
                ->exists();

            if (!$exists) {
                UserAllocation::create([
                    'userId' => $userId,
                    'unitAreaLocationId' => $unitId,
                ]);
                $added[] = $unitId;
            } else {
                $skipped[] = $unitId;
            }
        }

        return response()->json([
            'isSuccess' => true,
            'added' => $added,
            'skipped' => $skipped,
        ], 201);
    }

    public function allocationSettingsRemove(Request $request)
    {
        $validate = $request->validate([
            'userId' => 'required|exists:users,id',
            'unitAreaLocationId' => 'required|array',
            'unitAreaLocationId.*' => 'exists:unit_area_locations,unitAreaLocationId',
        ]);
        $userId = $validate['userId'];
        $unitAreaLocationIds = $validate['unitAreaLocationId'];

        if (!is_array($unitAreaLocationIds)) {
            return response()->json(['isSuccess' => false], 400);
        }


        foreach ($unitAreaLocationIds as $unitId) {
            $allocation = UserAllocation::where('userId', $userId)
                ->where('unitAreaLocationId', $unitId)
                ->first();

            if ($allocation) {
                $allocation->delete();
            } else {
                return response()->json([
                    'isSuccess' => false,
                    'message' => "Data with unitAreaLocationId $unitId not found for this user.",
                ], 404);
            }
        }

        return response()->json([
            'isSuccess' => true,
        ], 201);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
    public function show(UserAllocation $userAllocation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserAllocation $userAllocation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserAllocation $userAllocation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserAllocation $userAllocation)
    {
        //
    }
}
