<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Region;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Jawa', 'Kalimantan', 'Sumatera'] as $name) {
            Region::updateOrCreate(['name' => $name]);
        }

        $regionIdByName = Region::pluck('id', 'name');

        // Real-world geography behind each existing area (offshore/onshore
        // oil & gas fields), matched by name regardless of minor spelling
        // variants already present in the areas table (e.g. "ZULUl").
        $areaRegionMap = [
            'ZULU' => 'Jawa',
            'ZULUl' => 'Jawa',
            'Tambun' => 'Jawa',
            'Jati Asri' => 'Jawa',
            'Cilamaya' => 'Jawa',
            'Sindang' => 'Jawa',
            'Tarakan' => 'Kalimantan',
            'Anggana' => 'Kalimantan',
            'Rimau' => 'Sumatera',
            'Adera' => 'Sumatera',
            'Limau' => 'Sumatera',
            'Kampar' => 'Sumatera',
            'GNK' => 'Sumatera',
        ];

        foreach ($areaRegionMap as $areaName => $regionName) {
            $regionId = $regionIdByName[$regionName] ?? null;
            if (!$regionId) {
                continue;
            }
            Area::where('area', $areaName)->update(['region_id' => $regionId]);
        }

        // Cascade the region down to unit_positions via their location's area,
        // without touching any position whose area has no region assigned.
        DB::table('unit_positions')
            ->join('locations', 'unit_positions.location_id', '=', 'locations.id')
            ->join('areas', 'locations.area_id', '=', 'areas.id')
            ->whereNotNull('areas.region_id')
            ->update(['unit_positions.region_id' => DB::raw('areas.region_id')]);
    }
}
