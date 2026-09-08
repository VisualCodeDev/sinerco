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
    // Ambil daftar user dengan role technician dan operator untuk halaman UserList
    public function userList()
    {
        $technicianData = User::where('role', 'technician')->get();
        $operatorData = User::where('role', 'operator')->get();
        return Inertia::render('User/UserList', ['technicianData' => $technicianData, 'operatorData' => $operatorData]);
    }

    // Ambil semua data role, dikembalikan sebagai JSON
    public function getAllRoles()
    {
        $data = Role::all();
        return response()->json($data);
    }
    // Tampilkan halaman profil user beserta permission dan daftar request yang masih aktif
    public function index($user_id)
    {
        $userData = User::where('user_id', $user_id)->first();
        // Ambil unit yang diizinkan untuk user saat ini
        $permissionData = DataUnitController::getPermittedUnit();

        // Ambil id unit dari data permission, hilangkan duplikat dan nilai kosong
        $unitIds = collect($permissionData)->pluck('unit_id')->unique()->filter();

        // Ambil status request yang unit-nya termasuk dalam unit yang diizinkan
        $requestList = StatusRequest::whereHas('unitPosition', function ($query) use ($unitIds) {
            $query->whereIn('unit_id', $unitIds);
        })->with('unitPosition.unit')->get();
        // Hanya tampilkan request yang statusnya belum 'End'
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


    // Update nomor WhatsApp user setelah validasi format nomor
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

    // Update password user, wajib memasukkan password lama yang benar
    public function updatePassword(Request $request)
    {
        $val = $request->validate([
            'user_id' => 'required|string',
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::find($val['user_id']);
        if ($user) {
            // Hash password baru sebelum disimpan
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

        // Jika email diubah, reset status verifikasi email
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

        // Logout dulu sebelum menghapus akun user
        Auth::logout();

        $user->delete();

        // Bersihkan session agar tidak bisa dipakai lagi
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
