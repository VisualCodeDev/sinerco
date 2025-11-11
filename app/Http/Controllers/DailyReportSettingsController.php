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
        return Inertia::render('Unit/InputValidationSetting');
    }

    public function setSetting(Request $request)
    {
        Log::debug('Request Data: ', $request->all());
        $rules = [
            'client_id' => 'required|array',
            'decimalSetting' => 'required|array',
            'minMaxSetting' => 'required|array',
            'unitSetting' => 'required|array',
            'thresholdSetting' => 'required|array'
        ];

        foreach ($request->input('decimalSetting', []) as $key => $value) {
            $rules["decimalSetting.$key"] = 'required|numeric';
        }

        foreach ($request->input('minMaxSetting', []) as $key => $value) {
            $rules["minMaxSetting.$key.min"] = 'required|numeric';
            $rules["minMaxSetting.$key.max"] = 'nullable|numeric';
        }

        foreach ($request->input('thresholdSetting', []) as $key => $value) {
            $rules["thresholdSetting.$key.value"] = 'required|numeric';
            $rules["thresholdSetting.$key.type"] = 'required|string';
        }

        foreach ($request->input('unitSetting', []) as $key => $value) {
            $rules["unitSetting.$key"] = 'required|string';
        }
        $validated = $request->validate($rules);

        $client_ids = $validated['client_id'];

        foreach ((array) $client_ids as $client_id) {
            DailyReportSettings::updateOrCreate(
                ['client_id' => $client_id],
                [
                    'decimalSetting' => $validated['decimalSetting'],
                    'minMaxSetting' => $validated['minMaxSetting'],
                    'unitSetting' => $validated['unitSetting'],
                    'thresholdSetting' => $validated['thresholdSetting']
                ]
            );
        }

        return response()->json(['text' => 'Settings updated successfully', 'type' => 'success'], 200);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function getUnitSetting($client_id)
    {
        $data = DailyReportSettings::where('client_id', $client_id)->first();
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
