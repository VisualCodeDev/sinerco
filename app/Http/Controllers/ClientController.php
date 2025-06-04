<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\UnitAreaLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $allData = Client::all();
        return Inertia::render('Client/ClientList', ['data' => $allData]);
    }

    public function clientDetail($clientId)
    {
        $data = UnitAreaLocation::where('clientId', $clientId)->with('client', 'unit')->get();
        $clientData = $data->first()?->client;
        $unitData = UnitAreaLocation::where('clientId', $clientId)->with(['client', 'unit', 'dailyReportSetting'])->first();
        if ($data) {
            return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

}
