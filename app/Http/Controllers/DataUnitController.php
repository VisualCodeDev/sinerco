<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\UnitAreaLocation;
use Illuminate\Http\Request;

class DataUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getUnitAreaLocation()
    {
        $data = UnitAreaLocation::with(['unit', 'user'])->get();
        return response()->json($data);
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
