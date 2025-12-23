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
        $thresholdSetting = [
            "source_press" => ["value" => 100, "type" => 'percentage'],
            "suction_press" => ["value" => 100, "type" => 'percentage'],
            "discharge_press" => ["value" => 100, "type" => 'percentage'],
            "speed" => ["value" => 100, "type" => 'percentage'],
            "manifold_press" => ["value" => 100, "type" => 'percentage'],
            "oil_press" => ["value" => 100, "type" => 'percentage'],
            "oil_diff" => ["value" => 100, "type" => 'percentage'],
            "running_hours" => ["value" => 100, "type" => 'percentage'],
            "voltage" => ["value" => 100, "type" => 'percentage'],
            "water_temp" => ["value" => 100, "type" => 'percentage'],
            "static_press" => ["value" => 100, "type" => 'percentage'],
            "diff_press" => ["value" => 100, "type" => 'percentage'],
            "flowrate" => ["value" => 100, "type" => 'percentage'],
            "aft_cooler" => ["value" => 100, "type" => 'percentage'],
            "bef_cooler" => ["value" => 100, "type" => 'percentage'],
        ];

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
            DataUnit::firstOrCreate(
                ['unit' => $unit, 'unit_sn' => $unit, 'thresholdSetting' => $thresholdSetting],
            );
        }
    }
}
