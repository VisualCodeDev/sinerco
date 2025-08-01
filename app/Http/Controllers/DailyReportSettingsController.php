<?php

namespace App\Http\Controllers;

use App\Models\DailyReportSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DailyReportSettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Unit/UnitSetting');
    }

    public function setSetting(Request $request)
    {
        $rules = [
            'clientId' => 'required|array',
            'decimalSetting' => 'required|array',
            'minMaxSetting' => 'required|array',
        ];

        foreach ($request->input('decimalSetting', []) as $key => $value) {
            $rules["decimalSetting.$key"] = 'required|numeric';
        }

        foreach ($request->input('minMaxSetting', []) as $key => $value) {
            $rules["minMaxSetting.$key.min"] = 'required|numeric';
            $rules["minMaxSetting.$key.max"] = 'nullable|numeric';
        }

        $validated = $request->validate($rules);

        $clientIds = $validated['clientId'];

        foreach ((array) $clientIds as $clientId) {
            DailyReportSettings::updateOrCreate(
                ['clientId' => $clientId],
                [
                    'decimalSetting' => $validated['decimalSetting'],
                    'minMaxSetting' => $validated['minMaxSetting'],
                ]
            );
        }

        return response()->json(['text' => 'Settings updated successfully', 'type' => 'success'], 200);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function getUnitSetting($clientId)
    {
        $data = DailyReportSettings::where('clientId', $clientId)->first();
        return response()->json($data);
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
    public function show(DailyReportSettings $dailyReportSettings)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DailyReportSettings $dailyReportSettings)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DailyReportSettings $dailyReportSettings)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DailyReportSettings $dailyReportSettings)
    {
        //
    }
}
