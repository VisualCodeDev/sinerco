<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\DataUnit;
use App\Models\UnitAreaLocation;
use App\Models\UserDataUnit;
use Illuminate\Database\Seeder;
use Str;

class UnitAreaLocationSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $userData = UserDataUnit::select('userDataUnitId', 'user')->get()->toArray();
        $unitData = DataUnit::select('unitId', 'unit')->get()->toArray();
        foreach ($userData as $user) {
            foreach ($unitData as $unit) {
                if ($user['user'] === 'PHE ONWJ') {
                    if (
                        $unit['unit'] === 'MPI-5097-BC (A)' || $unit['unit'] === 'MPI-5298-BC (B)' || $unit['unit'] === 'MPI 5299 BC (C)'
                    )
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'ZULU Juct. Platform',
                                'area' => 'ZULU',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Tambun') {
                    if ($unit['unit'] === 'MP 632  RFD')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Tambun - Cluster F',
                                'area' => 'Tambun',
                            ]
                        );
                    if ($unit['unit'] === 'MP 3410 RFD')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Tambun - Cluster U',
                                'area' => 'Tambun',
                            ]
                        );
                    if ($unit['unit'] === 'MP 4060 BC')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Tambun - Cluster F',
                                'area' => 'Tambun',
                            ]
                        );
                    if ($unit['unit'] === 'MP 4221 BC')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Tambun - Cluster G',
                                'area' => 'Tambun',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Subang') {
                    if ($unit['unit'] === 'MPI 7105 (unit A)' || $unit['unit'] === 'MPI 7106 (unit B)' || $unit['unit'] === 'MPI 7118 (unit C)')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. JAS',
                                'area' => 'Jati Asri',
                            ]
                        );
                    if ($unit['unit'] === 'MPI 7101 (unit C)')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Cilamaya Utara',
                                'area' => 'Cilamaya',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Jatibarang') {
                    if (
                        $unit['unit'] === 'MP 5076 BC (unit A)' || $unit['unit'] === 'MP 5057 BC (unit B)' || $unit['unit'] === 'MP 5063 BC (unit C)' || $unit['unit'] === 'MPI 7115 (unit D)'
                    )
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Sindang',
                                'area' => 'Sindang',
                            ]
                        );
                }
                if ($user['user'] === 'MEDCO (Tarakan)') {
                    if (
                        $unit['unit'] === 'MPI 7108' || $unit['unit'] === 'MPI 7109' || $unit['unit'] === 'MPI 7110' || $unit['unit'] === 'MPI 7119' || $unit['unit'] === 'MPI 7120'
                    )
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'M-12',
                                'area' => 'Tarakan',
                            ]
                        );
                }
                if ($user['user'] === 'MEDCO (Rimau)') {
                    if ($unit['unit'] === 'MPI 7112')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'Langkap FSt.',
                                'area' => 'Rimau',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Sangasanga') {
                    if (
                        $unit['unit'] === 'MPI 5016' || $unit['unit'] === 'MPI 7107'
                    )
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. Site B',
                                'area' => 'Anggana',
                            ]
                        );
                    if ($unit['unit'] === 'MPI 7102')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. NKL',
                                'area' => 'Anggana',
                            ]
                        );
                    if ($unit['unit'] === 'MPI 7104')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'NKL - 1026',
                                'area' => 'Anggana',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Adera') {
                    if ($unit['unit'] === 'MPI 7116')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'BNG - 049',
                                'area' => 'Adera',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Limau') {
                    if ($unit['unit'] === 'MPI 5186' || $unit['unit'] === 'MPI 7103')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'KRG-12',
                                'area' => 'Limau',
                            ]
                        );
                    if ($unit['unit'] === 'MPI 7113')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'KRG-25',
                                'area' => 'Limau',
                            ]
                        );
                    if ($unit['unit'] === 'MPI 7117')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'TMB',
                                'area' => 'Limau',
                            ]
                        );
                }
                if ($user['user'] === 'EMP Riau') {
                    if ($unit['unit'] === 'MP 5012 BC')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'Panduk-2',
                                'area' => 'Kampar',
                            ]
                        );
                }
                if ($user['user'] === 'PEP Prabumulih') {
                    if ($unit['unit'] === 'MPI 7111' || $unit['unit'] === 'MPI 7114')
                        UnitAreaLocation::create(
                            [
                                'unitAreaLocationId' => Str::uuid7(),
                                'userDataUnitId' => $user['userDataUnitId'],
                                'unitId' => $unit['unitId'],
                                'location' => 'SP. GNK',
                                'area' => 'GNK',
                            ]
                        );
                }
            }
        }
    }
}
