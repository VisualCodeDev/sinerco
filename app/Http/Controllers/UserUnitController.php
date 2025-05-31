<?php

namespace App\Http\Controllers;

use App\Models\UnitAreaLocation;
use App\Models\UserDataUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserUnitController extends Controller
{
    public function index()
    {
        $allData = UserDataUnit::all();
        return Inertia::render('User/UserList', ['data' => $allData]);
    }

    public function userDetail($userId)
    {
        $data = UnitAreaLocation::where('userId', $userId)->with('user', 'unit')->get();
        $userData = $data->first()?->user;
        if ($data) {
            return Inertia::render('User/UserDetail', ['data' => $data, 'userData' => $userData]);
        }
    }

}
