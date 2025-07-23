<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\UnitAreaLocation;
use App\Models\User;
use App\Models\UserSetting;
use Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getAllUsers()
    {
        $users = User::with('roleData')->get();
        return response()->json(
            $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roleData?->name,
                'role_id' => $user->roleData?->id,
            ])
        );
    }
    public function newUserIndex()
    {
        $roles = Role::all();
        return Inertia::render('Setting/AddUser', ['roles' => $roles]);
    }

    public function addNewUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json(['text' => 'User Added', 'type' => 'success'], 200);
    }

    public function index()
    {
        $users = User::all();
        $roles = Role::all();
        // $technicianData = User::where('role', 'technician')->get();
        // $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('Setting/UserAllocation', ['roles' => $roles]);
    }
    public function allocationSettings($userId)
    {
        $userData = User::where('id', $userId)->first();
        $permittedData = UserSetting::where('userId', $userId)->with('unitArea.client', 'unitArea.unit', 'unitArea.location.area')->get()->toArray();

        $unitAreaData = [];
        $unitAreaData = UnitAreaLocation::with(['unit', 'client', 'location.area'])->get();
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
            $exists = UserSetting::where('userId', $userId)
                ->where('unitAreaLocationId', $unitId)
                ->exists();

            if (!$exists) {
                UserSetting::create([
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
            $allocation = UserSetting::where('userId', $userId)
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
