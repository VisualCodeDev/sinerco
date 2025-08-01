<?php

namespace Database\Seeders;

use App\Models\DataUnit;
use App\Models\ReportInputField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DataUnitFieldSeeder extends Seeder
{
    public function run(): void
    {
        $units = DataUnit::all();

        $fields = ReportInputField::all();

        foreach ($units as $unit) {
            foreach ($fields as $field) {
                DB::table('data_unit_field')->insert([
                    'unit_id' => $unit->unitId,
                    'field_id' => $field->id,
                    'isRequired' => true,
                ]);
            }
        }
    }
}
