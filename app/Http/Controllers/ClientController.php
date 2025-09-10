<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\UnitPosition;
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

    public function getAllClientAndUnits()
    {
        $allData = Client::with('units')->get();
        return response()->json($allData);
    }

    public function clientDetail(Request $request)
    {
        $client_id = $request->client_id;

        $data = UnitPosition::where('client_id', $client_id)->with('client', 'unit', 'location.area')->get();
        $clientData = $data->first()?->client;
        $unitData = UnitPosition::where('client_id', $client_id)->with(['client', 'unit', 'dailyReportSetting'])->first();
        if ($data) {
            return response()->json($data);
            // return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

    public function getFilteredAreaLocation(Request $request)
    {
        $client_id = $request->client_id;
        $data = UnitPosition::where('client_id', $client_id)->with('client', 'unit', 'location.area')->get();
        if ($data) {
            return response()->json($data);
            // return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

    public function updateDurationDisable(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,client_id',
        ]);

        $client = Client::where('client_id', $request->client_id)->first();

        if ($client) {
            $client->update([
                'disable_duration' => !(bool)$client->disable_duration,
            ]);
            return response()->json(['type' => 'success', 'text' => 'Duration updated']);
        } else {
            return response()->json(['type' => 'error', 'text' => 'Client not found']);
        }
    }

    public function setSettings(Request $request)
    {
        $request->validate([
            'clientSettings' => 'required|array',
        ]);

        foreach ($request->clientSettings as $client_id => $settings) {
            $client = Client::where('client_id', $client_id)->first();

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
        $data = Client::where('client_id', $request->client_id)->first();

        Log::debug($data);
        return response()->json($data);
    }
}
