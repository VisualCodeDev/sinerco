<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\UnitPosition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class ClientController extends Controller
{
    // Menampilkan halaman daftar client
    public function index()
    {
        return Inertia::render('Client/ClientList');
    }

    // Mengambil semua data client beserta lokasi, area, dan berita acara
    public function getAllClient()
    {
        $allData = Client::with([
            'locations.area',
            'unitPositions.baSettings'
        ])
            ->get()
            ->map(function ($client) {

                // Ambil lokasi unik milik client
                $locations = $client->locations->unique('id')->values();

                // Ambil daftar berita acara dari semua unit position client
                $beritaAcaras = $client->unitPositions
                    ->pluck('baSettings')
                    ->filter()
                    ->values();

                return [
                    ...$client->toArray(),
                    'is_invoice' => (bool) $client->is_invoice,
                    // Gabungkan nama lokasi jadi satu string dipisah koma
                    'locations' => $locations
                        ->pluck('location')
                        ->unique()
                        ->implode(', '),

                    // Gabungkan nama area jadi satu string dipisah koma
                    'areas' => $locations
                        ->pluck('area.area')
                        ->filter()
                        ->unique()
                        ->implode(', '),

                    'disable_duration' => (bool) $client->disable_duration,

                    'berita_acaras' => $beritaAcaras
                ];
            });

        return response()->json($allData);
    }

    // Mengambil semua client beserta relasi unit-nya
    public function getAllClientAndUnits()
    {
        $allData = Client::with('units')->get();
        return response()->json($allData);
    }

    // Mengambil detail unit position untuk satu client tertentu
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

    // Mengambil data area & lokasi yang sudah difilter berdasarkan client
    public function getFilteredAreaLocation(Request $request)
    {
        $client_id = $request->client_id;
        $data = UnitPosition::where('client_id', $client_id)->with('client', 'unit', 'location.area')->get();
        if ($data) {
            return response()->json($data);
            // return Inertia::render('Client/ClientDetail', ['data' => $data, 'clientData' => $clientData, 'unitData' => $unitData]);
        }
    }

    // Toggle status disable_duration pada client (aktif/nonaktif)
    public function updateDurationDisable(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,client_id',
        ]);

        $client = Client::where('client_id', $request->client_id)->first();

        if ($client) {
            // Balik nilai boolean disable_duration yang sekarang
            $client->update([
                'disable_duration' => !(bool) $client->disable_duration,
            ]);
            return response()->json(['type' => 'success', 'text' => 'Duration updated']);
        } else {
            return response()->json(['type' => 'error', 'text' => 'Client not found']);
        }
    }

    // Update pengaturan (interval, durasi, gmt offset, dll) untuk banyak client sekaligus
    public function setSettings(Request $request)
    {
        $request->validate([
            'clientSettings' => 'required|array',
        ]);
        // Loop tiap client_id beserta settingnya dari request
        foreach ($request->clientSettings as $client_id => $settings) {
            $client = Client::where('client_id', $client_id)->first();
            if ($client) {
                // Kalau field setting tidak dikirim, pakai nilai lama
                $client->update([
                    'input_interval' => $settings['input_interval'] ?? $client->input_interval,
                    'input_duration' => $settings['input_duration'] ?? $client->input_duration,
                    'gmt_offset' => $settings['gmt_offset'] ?? $client->gmt_offset,
                    'auto_send_interval' => $settings['auto_send_interval'] ?? $client->auto_send_interval,
                ]);
            } else {
                return response()->json(['type' => 'error', 'text' => 'Client not found']);
            }
        }

        return response()->json(['type' => 'success', 'text' => 'Settings updated']);
    }

    // Mengambil satu data client berdasarkan client_id
    public function getSelectedClient(Request $request)
    {
        $data = Client::where('client_id', $request->client_id)->first();

        Log::debug($data);
        return response()->json($data);
    }

    // Membuat client baru
    public function storeClient(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $client = Client::create(['name' => $request->name]);

        return response()->json([
            'type' => 'success',
            'text' => 'Client added.',
            'data' => $client,
        ]);
    }

    // Update data client (bisa banyak field sekaligus lewat updateData)
    public function updateClient(Request $request)
    {
        $val = $request->validate([
            'client_id' => 'required|exists:clients,client_id',
            'updateData' => 'required|array'
        ]);
        if(!$val) {
            return response()->json([

            ]);
        }

        // Gabungkan array updateData jadi satu array key-value untuk update
        $updateData = collect($request->updateData)
            ->reduce(function ($carry, $item) {
                return array_merge($carry, $item);
            }, []);

        $client = Client::where('client_id', $request->client_id)->first();

        $client->update($updateData);
        return response()->json([
            'response' => 'success',
            'data' => $client
        ]);
    }

    // Menghapus client berdasarkan client_id
    public function deleteClient(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,client_id',
        ]);

        $client = Client::where('client_id', $request->client_id)->first();
        $client->delete();

        return response()->json(['type' => 'success', 'text' => 'Client deleted successfully']);
    }
}
