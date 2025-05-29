<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\DataUnit;
use Illuminate\Database\Seeder;
use Str;

class DataUnitSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $units = [
            'MPI-5097-BC (A)',
            'MPI-5298-BC (B)',
            'MPI 5299 BC (C)',
            'MP 632  RFD',
            'MP 3410 RFD',
            'MP 4060 BC',
            'MP 4221 BC',
            'MPI 7105 (unit A)',
            'MPI 7106 (unit B)',
            'MPI 7118 (unit C)',
            'MPI 7101 (unit C)',
            'MP 5076 BC (unit A)',
            'MP 5057 BC (unit B)',
            'MP 5063 BC (unit C)',
            'MPI 7115 (unit D)',
            'MPI 7108',
            'MPI 7109',
            'MPI 7110',
            'MPI 7119',
            'MPI 7120',
            'MPI 5016',
            'MPI 7102',
            'MPI 7104',
            'MPI 7107',
            'MPI 7116',
            'MPI 5186',
            'MPI 7103',
            'MPI 7113',
            'MPI 7117',
            'MP 5012 BC',
            'MPI 7112',
            'MPI 7111',
            'MPI 7114',
        ];

        foreach ($units as $unit) {
            DataUnit::updateOrCreate(
                ['unit' => $unit],
                [
                    'unitId' => (string) Str::uuid7(),
                ]
            );
        }
    }
}
