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

}
