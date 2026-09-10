<?php

namespace App\Http\Controllers;

use App\Models\UnitPosition;
use App\Models\Workshop;
use App\Services\UnitMovementLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class WorkshopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Menampilkan halaman daftar workshop
    public function index()
    {
        return Inertia::render('Workshop/WorkshopList');
    }

    /**
     * Show the form for creating a new resource.
     */
    // Mengambil semua data workshop beserta unit-unitnya
    public function getAllWorkshops()
    {
        $allData = Workshop::with('units')->get();
        return response()->json($allData);
    }

    // Menyimpan workshop baru
    public function storeWorkshop(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workshop = Workshop::create(['name' => $request->name]);

        return response()->json([
            'type' => 'success',
            'text' => 'Workshop added.',
            'data' => $workshop,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    // Mengambil data workshop berdasarkan id
    public function getSelectedWorkshops(Request $request)
    {
        $data = Workshop::where('workshop_id', $request->workshop_id)->first();
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
        $val = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workshop->update(['name' => $val['name']]);

        return response()->json([
            'type' => 'success',
            'text' => 'Workshop updated.',
            'data' => $workshop->fresh(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workshop $workshop)
    {
        // Unit yang masih ditempatkan di workshop ini jangan sampai jadi yatim
        // (workshop_id nyantol ke workshop yang sudah tidak ada) -- lepas dulu
        // posisinya sebelum workshop-nya dihapus. Kalau tidak dilepas dulu, FK
        // cascade di unit_positions.workshop_id bakal ikut MENGHAPUS baris
        // posisi unit itu sendiri, bukan cuma melepas workshop-nya.
        $unitIds = UnitPosition::where('workshop_id', $workshop->workshop_id)->pluck('unit_id')->all();
        $before = UnitMovementLogger::snapshot($unitIds);
        UnitPosition::where('workshop_id', $workshop->workshop_id)->update([
            'workshop_id' => null,
            'position_type' => null,
        ]);
        UnitMovementLogger::commit($before, 'remove_client');

        $workshop->delete();

        return response()->json([
            'type' => 'success',
            'text' => 'Workshop deleted.',
        ]);
    }
}
