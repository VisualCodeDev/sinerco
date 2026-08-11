<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $areas = Area::with(['locations'])->get();
        return Inertia::render('Location/Location', ['areas' => $areas]);
    }

    public function getAreas()
    {
        return response()->json(Area::with(['locations'])->get());
    }

    public function storeArea(Request $request)
    {
        $request->validate(['area' => 'required|string|max:255']);
        $area = Area::create(['area' => $request->area]);
        return response()->json(['type' => 'success', 'text' => 'Area added.', 'area' => $area], 200);
    }

    public function updateArea(Request $request, Area $area)
    {
        $request->validate(['area' => 'required|string|max:255']);
        $area->update(['area' => $request->area]);
        return response()->json(['type' => 'success', 'text' => 'Area updated.'], 200);
    }

    public function destroyArea(Area $area)
    {
        $hasUnits = $area->locations()->whereHas('unitPositions')->exists();
        if ($hasUnits) {
            return response()->json([
                'type' => 'error',
                'text' => 'Cannot delete area with locations that have units assigned.',
            ], 422);
        }
        $area->delete();
        return response()->json(['type' => 'success', 'text' => 'Area deleted.'], 200);
    }

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

    public function updateLocation(Request $request, Location $location)
    {
        $request->validate(['location' => 'required|string|max:255']);
        $location->update(['location' => $request->location]);
        return response()->json(['type' => 'success', 'text' => 'Location updated.'], 200);
    }

    public function destroyLocation(Location $location)
    {
        if ($location->unitPositions()->exists()) {
            return response()->json([
                'type' => 'error',
                'text' => 'Cannot delete location with units assigned to it.',
            ], 422);
        }
        $location->delete();
        return response()->json(['type' => 'success', 'text' => 'Location deleted.'], 200);
    }
}
