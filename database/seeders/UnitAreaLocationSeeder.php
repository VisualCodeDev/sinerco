<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Area;
use App\Models\Client;
use App\Models\DataUnit;
use App\Models\Location;
use App\Models\UnitAreaLocation;
use Illuminate\Database\Seeder;
use Str;

class UnitAreaLocationSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $mapping = [
            'PHE ONWJ' => [
                'MPI-5097-BC (A)' => ['ZULU', 'ZULU Juct. Platform'],
                'MPI-5298-BC (B)' => ['ZULU', 'ZULU Juct. Platform'],
                'MPI 5299 BC (C)' => ['ZULU', 'ZULU Juct. Platform'],
            ],
            'PEP Tambun' => [
                'MP 632  RFD' => ['Tambun', 'SP. Tambun - Cluster F'],
                'MP 3410 RFD' => ['Tambun', 'SP. Tambun - Cluster U'],
                'MP 4060 BC' => ['Tambun', 'SP. Tambun - Cluster F'],
                'MP 4221 BC' => ['Tambun', 'SP. Tambun - Cluster G'],
            ],
            'PEP Subang' => [
                'MPI 7105 (unit A)' => ['Jati Asri', 'SP. JAS'],
                'MPI 7106 (unit B)' => ['Jati Asri', 'SP. JAS'],
                'MPI 7118 (unit C)' => ['Jati Asri', 'SP. JAS'],
                'MPI 7101 (unit C)' => ['Cilamaya', 'SP. Cilamaya Utara'],
            ],
            'PEP Jatibarang' => [
                'MP 5076 BC (unit A)' => ['Sindang', 'SP. Sindang'],
                'MP 5057 BC (unit B)' => ['Sindang', 'SP. Sindang'],
                'MP 5063 BC (unit C)' => ['Sindang', 'SP. Sindang'],
                'MPI 7115 (unit D)' => ['Sindang', 'SP. Sindang'],
            ],
            'MEDCO (Tarakan)' => [
                'MPI 7108' => ['Tarakan', 'M-12'],
                'MPI 7109' => ['Tarakan', 'M-12'],
                'MPI 7110' => ['Tarakan', 'M-12'],
                'MPI 7119' => ['Tarakan', 'M-12'],
                'MPI 7120' => ['Tarakan', 'M-12'],
            ],
            'MEDCO (Rimau)' => [
                'MPI 7112' => ['Rimau', 'Langkap FSt.'],
            ],
            'PEP Sangasanga' => [
                'MPI 5016' => ['Anggana', 'SP. Site B'],
                'MPI 7107' => ['Anggana', 'SP. Site B'],
                'MPI 7102' => ['Anggana', 'SP. NKL'],
                'MPI 7104' => ['Anggana', 'NKL - 1026'],
            ],
            'PEP Adera' => [
                'MPI 7116' => ['Adera', 'BNG - 049'],
            ],
            'PEP Limau' => [
                'MPI 5186' => ['Limau', 'KRG-12'],
                'MPI 7103' => ['Limau', 'KRG-12'],
                'MPI 7113' => ['Limau', 'KRG-25'],
                'MPI 7117' => ['Limau', 'TMB'],
            ],
            'EMP Riau' => [
                'MP 5012 BC' => ['Kampar', 'Panduk-2'],
            ],
            'PEP Prabumulih' => [
                'MPI 7111' => ['GNK', 'SP. GNK'],
                'MPI 7114' => ['GNK', 'SP. GNK'],
            ],
        ];
        $userData = Client::select('clientId', 'name')->get()->toArray();
        $unitData = DataUnit::select('unitId', 'unit')->get()->toArray();

        foreach ($userData as $user) {
            foreach ($unitData as $unit) {
                $clientName = $user['name'];
                $unitName = $unit['unit'];

                if (isset($mapping[$clientName][$unitName])) {
                    [$areaName, $locationName] = $mapping[$clientName][$unitName];

                    $area = Area::where('area', $areaName)->first();
                    if (!$area)
                        continue;

                    $location = Location::where('areaId', $area->id)
                        ->where('location', $locationName)
                        ->first();

                    if (!$location) {
                        continue;
                    }

                    UnitAreaLocation::updateOrCreate(
                        [
                            'clientId' => $user['clientId'],
                            'unitId' => $unit['unitId'],
                        ],
                        [
                            'unitAreaLocationId' => Str::uuid7(),
                            'locationId' => $location->id,
                        ]
                    );
                }
            }
        }

    }
}
