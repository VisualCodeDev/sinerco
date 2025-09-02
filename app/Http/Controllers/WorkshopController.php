<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class WorkshopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Workshop/WorkshopList');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function getAllWorkshops()
    {
        $allData = Workshop::with('units')->get();
        return response()->json($allData);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function getSelectedWorkshops(Request $request)
    {
        $data = Workshop::find($request);
        return response()->json($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workshop $workshop)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Workshop $workshop)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workshop $workshop)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workshop $workshop)
    {
        //
    }
}
