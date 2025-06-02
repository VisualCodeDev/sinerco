<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserAlocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserAlocationController extends Controller
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
    public function show(UserAlocation $userAlocation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserAlocation $userAlocation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserAlocation $userAlocation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserAlocation $userAlocation)
    {
        //
    }
}
