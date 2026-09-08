<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    // Menampilkan halaman utama Location beserta data area dan region
    public function index()
    {
        $areas = Area::with(['locations', 'region'])->get(); // ambil semua area beserta lokasi dan region-nya
        $regions = Region::orderBy('name')->get(); // ambil semua region urut nama
        return Inertia::render('Location/Location', ['areas' => $areas, 'regions' => $regions]);
    }

    // Mengambil data semua area dalam format JSON
    public function getAreas()
    {
        return response()->json(Area::with(['locations', 'region'])->get());
    }

    // Menyimpan area baru
    public function storeArea(Request $request)
    {
        $request->validate([
            'area' => 'required|string|max:255',
            'region_id' => 'nullable|exists:regions,id',
        ]);
        $area = Area::create(['area' => $request->area, 'region_id' => $request->region_id]);
        return response()->json(['type' => 'success', 'text' => 'Area added.', 'area' => $area], 200);
    }

    // Mengubah data area yang sudah ada
    public function updateArea(Request $request, Area $area)
    {
        $request->validate([
            'area' => 'required|string|max:255',
            'region_id' => 'nullable|exists:regions,id',
        ]);
        $area->update($request->only(['area', 'region_id']));
        return response()->json(['type' => 'success', 'text' => 'Area updated.'], 200);
    }

    // Menghapus area, tapi ditolak jika masih ada unit yang terpasang di lokasi area ini
    public function destroyArea(Area $area)
    {
        $hasUnits = $area->locations()->whereHas('unitPositions')->exists(); // cek apakah ada unit terkait
        if ($hasUnits) {
            return response()->json([
                'type' => 'error',
                'text' => 'Cannot delete area with locations that have units assigned.',
            ], 422);
        }
        $area->delete();
        return response()->json(['type' => 'success', 'text' => 'Area deleted.'], 200);
    }

    // Menyimpan lokasi baru di bawah sebuah area
    public function storeLocation(Request $request)
    {
        $request->validate([
            'location' => 'required|string|max:255',
            'area_id'  => 'required|exists:areas,id',
        ]);
        $location = Location::create([
            'location' => $request->location,
            'area_id'  => $request->area_id,
        ]);
        return response()->json(['type' => 'success', 'text' => 'Location added.', 'location' => $location], 200);
    }

    // Mengubah data lokasi yang sudah ada
    public function updateLocation(Request $request, Location $location)
    {
        $request->validate([
            'location' => 'required|string|max:255',
            'area_id' => 'nullable|exists:areas,id',
        ]);
        $location->update($request->only(['location', 'area_id']));
        return response()->json(['type' => 'success', 'text' => 'Location updated.'], 200);
    }

    // Menghapus lokasi, ditolak jika masih ada unit yang terpasang
    public function destroyLocation(Location $location)
    {
        if ($location->unitPositions()->exists()) { // cek unit terkait di lokasi ini
            return response()->json([
                'type' => 'error',
                'text' => 'Cannot delete location with units assigned to it.',
            ], 422);
        }
        $location->delete();
        return response()->json(['type' => 'success', 'text' => 'Location deleted.'], 200);
    }

    // Mengambil data semua region beserta area dan lokasi di dalamnya
    public function getRegions()
    {
        return response()->json(Region::with(['areas.locations'])->get());
    }

    // Menyimpan region baru
    public function storeRegion(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $region = Region::create(['name' => $request->name]);
        return response()->json(['type' => 'success', 'text' => 'Region added.', 'region' => $region], 200);
    }

    // Mengubah nama region yang sudah ada
    public function updateRegion(Request $request, Region $region)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $region->update(['name' => $request->name]);
        return response()->json(['type' => 'success', 'text' => 'Region updated.'], 200);
    }

    // Menghapus region, ditolak jika masih ada area yang terkait
    public function destroyRegion(Region $region)
    {
        if ($region->areas()->exists()) { // cek apakah masih ada area di region ini
            return response()->json([
                'type' => 'error',
                'text' => 'Cannot delete region with areas assigned to it.',
            ], 422);
        }
        $region->delete();
        return response()->json(['type' => 'success', 'text' => 'Region deleted.'], 200);
    }
}
