<?php

namespace App\Http\Controllers;

use App\Models\DailyField;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyFieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Unit/InputFieldSetting');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function getFields()
    {
        try {
            $data = DailyField::with('subfields')->get();
            return response()->json($data);
        } catch (\Exception $e) {
            \Log::error('Error ambil field: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
    public function show(DailyField $dailyField)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DailyField $dailyField)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DailyField $dailyField)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DailyField $dailyField)
    {
        //
    }
}
