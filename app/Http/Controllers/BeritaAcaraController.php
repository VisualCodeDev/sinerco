<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcara;
use App\Models\DataUnit;
use App\Models\UnitPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BeritaAcaraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('BA/BaPage');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function getBaUnits()
    {
        $data = UnitPosition::with('baSettings', 'unit', 'location.area')
            ->get()
            ->map(function ($item) {
                return [
                    'unit_position_id' => $item->id,
                    'unit' => $item->unit->unit,
                    'unit_sn' => $item->unit->unit_sn,
                    'pic_name' => $item->baSettings?->pic_name,
                    'pic_department' => $item->baSettings?->pic_department,
                    'client_name' => $item->baSettings?->client_name,
                    'client_department' => $item->baSettings?->client_department,
                    'spv_name' => $item->baSettings?->spv_name,
                    'spv_department' => $item->baSettings?->spv_department,
                    'location' => $item->location->location,
                    'area' => $item->location->area->area,
                ];
            });
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function SetFieldBA(Request $request)
    {
        $validated = $request->validate([
            'selectedUnits' => 'required|array',
            'spv_name' => 'nullable|string',
            'spv_department' => 'nullable|string',
            'pic_name' => 'nullable|string',
            'pic_department' => 'nullable|string',
            'client_name' => 'nullable|string',
            'client_department' => 'nullable|string',
        ]);

        foreach ($validated['selectedUnits'] as $unitPosId) {
            if (!$unitPosId)
                continue;

            BeritaAcara::updateOrCreate(
                [
                    'unit_position_id' => $unitPosId,
                ],
                [
                    'spv_name' => $validated['spv_name'] ?? null,
                    'spv_department' => $validated['spv_department'] ?? null,
                    'pic_name' => $validated['pic_name'] ?? null,
                    'pic_department' => $validated['pic_department'] ?? null,
                    'client_name' => $validated['client_name'] ?? null,
                    'client_department' => $validated['client_department'] ?? null,
                ]
            );
        }

        return response()->json([
            'message' => 'Berita Acara saved successfully',
        ], 200);
    }


    /**
     * Display the specified resource.
     */
    public function show(BeritaAcara $beritaAcara)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BeritaAcara $beritaAcara)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BeritaAcara $beritaAcara)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BeritaAcara $beritaAcara)
    {
        //
    }
}
