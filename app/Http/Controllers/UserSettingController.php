<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\UnitAreaLocation;
use App\Models\UnitPosition;
use App\Models\User;
use App\Models\UserSetting;
use Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

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
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roleData?->name,
                'role_id' => $user->roleData?->id,
            ])
        );
    }

    public function getPermittedUnitData($user_id)
    {
        $permittedData = UserSetting::where('user_id', $user_id)
            ->with('unitArea.client', 'unitArea.unit', 'unitArea.location.area')
            ->get();

        $data = $permittedData->map(function ($item) {
            return [
                'unit_id' => $item?->unitArea->unit_id,
                'unit' => $item?->unitArea->unit?->unit,
                'client' => $item?->unitArea->client?->name,
                'location' => $item?->unitArea->location?->location,
                'area' => $item?->unitArea->location?->area?->area,
                'unit_position_id' => $item->unit_position_id,
            ];
        });

        return response()->json($data);
    }


    public function newUserIndex()
    {
        $roles = Role::all();
        return Inertia::render('User/AddUser', ['roles' => $roles]);
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
        $roles = Role::all();
        // $technicianData = User::where('role', 'technician')->get();
        // $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('User/UserList', ['roles' => $roles]);
    }
    public function allocationSettings($user_id)
    {
        $userData = User::select(['user_id', 'name', 'email', 'role_id'])
            ->where('user_id', $user_id)
            ->first();
        $roleData = Role::all();
        $unitAreaData = [];
        $unitAreaData = UnitPosition::with(['unit', 'client', 'location.area'])->get();

        $data = $unitAreaData->map(function ($item) {
            return [
                'unit_id' => $item?->unit_id,
                'unit' => $item->unit?->unit,
                'client' => $item->client?->name,
                'location' => $item->location?->location,
                'area' => $item->location?->area?->area,
                'unit_position_id' => $item->id,
            ];
        });


        return Inertia::render('User/UserAllocationSetting', ['data' => $userData, 'unitAreaData' => $data, 'roleData' => $roleData]);
    }

    public function allocationSettingsAdd(Request $request)
    {
        $validate = $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'unit_position_id' => 'required|array',
            'unit_position_id.*' => 'exists:unit_positions,id',
        ]);
        $user_id = $validate['user_id'];
        $unit_position_ids = $validate['unit_position_id'];

        if (!is_array($unit_position_ids)) {
            return response()->json(['isSuccess' => false], 400);
        }

        $added = [];
        $skipped = [];

        foreach ($unit_position_ids as $unitId) {
            $exists = UserSetting::where('user_id', $user_id)
                ->where('unit_position_id', $unitId)
                ->exists();

            if (!$exists) {
                UserSetting::create([
                    'user_id' => $user_id,
                    'unit_position_id' => $unitId,
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
            'user_id' => 'required|exists:users,user_id',
            'unit_position_id' => 'required|array',
            'unit_position_id.*' => 'exists:unit_positions,id',
        ]);
        $user_id = $validate['user_id'];
        $unit_position_ids = $validate['unit_position_id'];

        if (!is_array($unit_position_ids)) {
            return response()->json(['isSuccess' => false], 400);
        }


        foreach ($unit_position_ids as $unitId) {
            $allocation = UserSetting::where('user_id', $user_id)
                ->where('unit_position_id', $unitId)
                ->first();

            if ($allocation) {
                $allocation->delete();
            } else {
                return response()->json([
                    'isSuccess' => false,
                    'message' => "Data with unit_position_id $unitId not found for this user.",
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
    public function editUser(Request $request, $user_id)
    {
        $request->validate([
            'name' => 'sometimes|string',
            'role' => 'sometimes|numeric',
            'password' => 'sometimes|string|min:8'
        ]);
        $user = User::where($user_id);
        $user->update(['name' => $request->name, 'role_id' => $request->role, 'password' => $request->password ? Hash::make($request->password) : $user->password]);
        return response()->json(['text' => 'User Edit Succesfully', 'type' => 'success'], 200);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function getSelectedUser($user_id)
    {
        $user = User::where('id', $user_id)->firstOrFail();
        return response()->json($user);
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
