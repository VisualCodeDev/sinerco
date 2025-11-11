<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\DailyField;
use App\Models\DailyReportSettings;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DailyReportSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        //
        $clients = Client::all();
        $units = [
            "source_press" => 'psig',
            "suction_press" => 'psig',
            "discharge_press" => 'psig',
            "speed" => 'RPM',
            "manifold_press" => 'psig',
            "oil_press" => 'psig',
            "oil_diff" => 'psig',
            "running_hours" => 'Hour',
            "voltage" => 'V',
            "water_temp" => '°F',
            "static_press" => 'psig',
            "diff_press" => 'in H2O',
            "flowrate" => 'MSCFD',
            "aft_cooler" => "°F",
            "bef_cooler" => "°F",
        ];

        $fields = DailyField::all();

        $decimalSetting = [
            "source_press" => "1",
            "suction_press" => "1",
            "discharge_press" => "1",
            "speed" => "0",
            "aft_cooler" => "1",
            "bef_cooler" => "1",
            "manifold_press" => "1",
            "oil_press" => "1",
            "oil_diff" => "1",
            "running_hours" => "0",
            "voltage" => "1",
            "water_temp" => "1",
            "static_press" => "1",
            "diff_press" => "1",
            "flowrate" => "6",
        ];

        $minMaxSetting = [
            "suction_press" => ["min" => -9, "max" => 60],
            "discharge_press" => ["min" => 0, "max" => 400],
            "speed" => ["min" => 1500, "max" => 2200],
            "manifold_press" => ["min" => -6, "max" => -2],
            "oil_press" => ["min" => 30, "max" => 70],
            "voltage" => ["min" => 27, "max" => 28],
            "water_temp" => ["min" => -194],
            "aft_cooler" => ["min" => 120, "max" => null],
            "bef_cooler" => ["min" => 350, "max" => null],
        ];

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

        foreach ($clients as $client) {
            DailyReportSettings::create([
                'client_id' => $client->client_id,
                'decimalSetting' => json_encode($decimalSetting),
                'minMaxSetting' => json_encode($minMaxSetting),
                'unitSetting' => json_encode($units),
                'thresholdSetting' => json_encode($thresholdSetting)
            ]);
        }

    }
}
