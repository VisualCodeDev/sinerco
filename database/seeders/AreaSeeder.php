<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $areas = [
            'ZULU',
            'Tambun',
            'Jati Asri',
            'Cilamaya',
            'Sindang',
            'Tarakan',
            'Rimau',
            'Anggana',
            'Adera',
            'Limau',
            'Kampar',
            'GNK'
        ];

        $areaLocations = [
            'ZULU' => ['ZULU Juct. Platform'],
            'Tambun' => ['SP. Tambun - Cluster F', 'SP. Tambun - Cluster U', 'SP. Tambun - Cluster G'],
            'Jati Asri' => ['SP. JAS'],
            'Cilamaya' => ['SP. Cilamaya Utara'],
            'Sindang' => ['SP. Sindang'],
            'Tarakan' => ['M-12'],
            'Rimau' => ['Langkap FSt.'],
            'Anggana' => ['SP. Site B', 'SP. NKL', 'NKL - 1026'],
            'Adera' => ['BNG - 049'],
            'Limau' => ['KRG-12', 'KRG-25', 'TMB'],
            'Kampar' => ['Panduk-2'],
            'GNK' => ['SP. GNK'],
        ];

        foreach ($areas as $areaName) {
            $area = Area::updateOrCreate(['area' => $areaName]);

            if (isset($areaLocations[$areaName])) {
                foreach ($areaLocations[$areaName] as $locationName) {
                    Location::updateOrCreate(
                        [
                            'area_id' => $area->id,
                            'location' => $locationName
                        ]
                    );
                }
            }
        }

    }
}
