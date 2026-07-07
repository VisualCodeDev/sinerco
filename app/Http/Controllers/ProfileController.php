<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Role;
use App\Models\unitPosition;
use App\Models\User;
use App\Models\UserAlocation;
use App\Models\Client;
use App\Models\StatusRequest;
use App\Models\UserPermission;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function userList()
    {
        $technicianData = User::where('role', 'technician')->get();
        $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('User/UserList', ['technicianData' => $technicianData, 'operatorData' => $operatorData]);
    }

    public function getAllRoles()
    {
        $data = Role::all();
        return response()->json($data);
    }
    public function index($user_id)
    {
        $userData = User::where('user_id', $user_id)->first();
        $permissionData = DataUnitController::getPermittedUnit();

        $unitIds = collect($permissionData)->pluck('unit_id')->unique()->filter();

        $requestList = StatusRequest::whereHas('unitPosition', function ($query) use ($unitIds) {
            $query->whereIn('unit_id', $unitIds);
        })->with('unitPosition.unit')->get();
        $requestList = collect($requestList)
            ->filter(fn($item) => $item->status !== 'End')
            ->values()
            ->toArray();
        ;


        // if ($userData->role == 'operator') {
        //     $unitAreaData = Client::all();
        // }
        return Inertia::render('Profile/Profile', ['data' => $userData, 'permissionData' => $permissionData, 'requestList' => $requestList]);
    }
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }


    public function updatePhone(Request $request)
    {
        $val = $request->validate(
            [
                'user_id' => 'required|string',
                'whatsAppNum' => 'required|regex:/^08[0-9]+$/|min:10|max:13'
            ]
        );

        $user = User::find($val['user_id']);
        if ($user) {
            $user->update(['whatsAppNum' => $val['whatsAppNum']]);
            return response()->json(['type' => 'success', 'text' => 'Phone number updated']);
        }
        ;
        return response()->json(['type' => 'error', 'text' => 'User not found']);
    }

    public function updatePassword(Request $request)
    {
        $val = $request->validate([
            'user_id' => 'required|string',
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::find($val['user_id']);
        if ($user) {
            $user->update(['password' => Hash::make($val['password'])]);
            return response()->json(['type' => 'success', 'text' => 'Password updated']);
        }

        return response()->json(['type' => 'error', 'text' => 'User not found']);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
