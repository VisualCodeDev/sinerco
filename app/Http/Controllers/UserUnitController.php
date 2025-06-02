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
        $data = UnitAreaLocation::where('userDataUnitId', $userId)->with('user', 'unit', 'dailyReportSetting')->get();
        $userData = $data->first()->dailyReportSetting;
        if ($data) {
            return Inertia::render('User/UserDetail', ['data' => $data, 'userData' => $userData]);
        }
    }

}
