<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\UnitPosition;
use App\Services\UnitMovementLogger;
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
            'locations.area.region',
            'unitPositions.baSettings',
            'unitPositions.region',
            'unitPositions.location.area.region',
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

                // Region per unit_position bisa di-set langsung (lihat
                // updateClientLocation di bawah) ATAU ikut dari location->area->region
                // kalau tidak di-set -- sama seperti pola di DataUnitController.
                $regions = $client->unitPositions
                    ->map(function ($pos) {
                        return $pos->region?->name ?? $pos->location?->area?->region?->name;
                    })
                    ->filter()
                    ->unique();

                return [
                    ...$client->toArray(),
                    'is_invoice' => (bool) $client->is_invoice,
                    // Gabungkan nama region jadi satu string dipisah koma
                    'regions' => $regions->implode(', '),

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

                    'berita_acaras' => $beritaAcaras,

                    // Dipakai buat pesan konfirmasi di frontend ("ini akan mindahin
                    // N unit ke area/lokasi baru") sebelum bulk-update lokasi client
                    'unit_count' => $client->unitPositions->count(),
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

        // Gabungkan array updateData jadi satu array key-value untuk update
        $updateData = collect($request->updateData)
            ->reduce(function ($carry, $item) {
                return array_merge($carry, $item);
            }, []);

        // Jangan izinkan mengubah primary key client_id lewat updateData
        unset($updateData['client_id']);

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

    // Memindahkan SEMUA unit milik client ini ke region/area/location baru sekaligus.
    // Client sendiri tidak punya 1 area/location tetap (client bisa punya banyak unit
    // yang tersebar di banyak lokasi) -- "area/location milik client" itu cuma hasil
    // agregat dari lokasi unit-unitnya (lihat getAllClient di atas). Jadi meng-edit
    // "lokasi client" di sini artinya benar-benar MEMINDAHKAN semua unit client ini
    // ke lokasi baru, bukan cuma ubah 1 kolom di tabel clients. Makanya di frontend
    // wajib ada konfirmasi dulu sebelum manggil endpoint ini (aksi ini bulk & langsung
    // berefek ke banyak unit_position sekaligus).
    public function updateClientLocation(Request $request)
    {
        $val = $request->validate([
            'client_id' => 'required|exists:clients,client_id',
            'region_id' => 'nullable|exists:regions,id',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $unitIds = UnitPosition::where('client_id', $val['client_id'])->pluck('unit_id')->all();
        $before = UnitMovementLogger::snapshot($unitIds);

        $affected = UnitPosition::where('client_id', $val['client_id'])->update([
            'region_id' => $val['region_id'] ?? null,
            'location_id' => $val['location_id'] ?? null,
        ]);

        UnitMovementLogger::commit($before, 'client_bulk_move');

        return response()->json([
            'type' => 'success',
            'text' => "Moved {$affected} unit(s) to the new area/location.",
        ]);
    }
}
