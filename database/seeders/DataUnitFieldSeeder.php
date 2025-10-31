<?php

namespace Database\Seeders;

use App\Models\DailyField;
use App\Models\DataUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DataUnitFieldSeeder extends Seeder
{
    public function run(): void
    {
        $units = DataUnit::all();

        $fields = DailyField::all();

        foreach ($units as $unit) {
            foreach ($fields as $field) {
                DB::table('unit_fields')->insert([
                    'unit_id' => $unit->unit_id,
                    'field_id' => $field->id,
                    'required' => true,
                ]);
            }
        }
    }
}
