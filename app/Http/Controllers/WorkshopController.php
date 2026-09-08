<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
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
        $data = Workshop::find($request);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workshop $workshop)
    {
        //
    }
}
