<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\UnitAreaLocation;
use App\Models\User;
use App\Models\UserAlocation;
use App\Models\Client;
use App\Models\StatusRequest;
use App\Models\UserPermission;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function userList()
    {
        $technicianData = User::where('role', 'technician')->get();
        $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('Setting/UserAllocation', ['technicianData' => $technicianData, 'operatorData' => $operatorData]);
    }
    public function index($userId)
    {
        $userData = User::where('id', $userId)->first();
        $permissionData = DataUnitController::getPermittedUnit(); // returns an array

        $unitIds = collect($permissionData)->pluck('unitId')->unique()->filter();

        $requestList = StatusRequest::whereIn('unitId', $unitIds)->with('unit')->get();
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
