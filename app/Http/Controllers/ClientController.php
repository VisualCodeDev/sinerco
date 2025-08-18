<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\UnitAreaLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class ClientController extends Controller
{
    public function index()
    {
        return Inertia::render('Client/ClientList');
    }

    public function getAllClient()
    {
        $allData = Client::all();
        return response()->json($allData);
    }

    public function clientDetail(Request $request)
    {
        $clientId = $request->clientId;

        $data = UnitAreaLocation::where('clientId', $clientId)->with('client', 'unit', 'location.area')->get();
        $clientData = $data->first()?->client;
        $unitData = UnitAreaLocation::where('clientId', $clientId)->with(['client', 'unit', 'dailyReportSetting'])->first();
        if ($data) {
            return response()->json($data);
            // return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

    public function getFilteredAreaLocation(Request $request)
    {
        $clientId = $request->clientId;
        $data = UnitAreaLocation::where('clientId', $clientId)->with('client', 'unit', 'location.area')->get();
        if ($data) {
            return response()->json($data);
            // return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

    public function setSettings(Request $request)
    {
        $request->validate([
            'clientSettings' => 'required|array',
        ]);

        foreach ($request->clientSettings as $clientId => $settings) {
            $client = Client::where('clientId', $clientId)->first();

            if ($client) {
                $client->update([
                    'input_interval' => $settings['input_interval'] ?? $client->input_interval,
                    'input_duration' => $settings['input_duration'] ?? $client->input_duration,
                ]);
            } else {
                return response()->json(['type' => 'error', 'text' => 'Client not found']);
            }
        }

        return response()->json(['type' => 'success', 'text' => 'Settings updated']);
    }

    public function getSelectedClient(Request $request)
    {
        $data = Client::where('clientId', $request->clientId)->first();

        Log::debug($data);
        return response()->json($data);
    }
}
