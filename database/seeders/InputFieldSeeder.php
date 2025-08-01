<?php

namespace Database\Seeders;

use App\Models\ReportInputField;
use App\Models\ReportSubField;
use Illuminate\Database\Seeder;
use Str;

class InputFieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            'Time',
            'Suction Press',
            'Discharge Press',
            'Speed',
            'Manifold Press',
            'Oil Press',
            'Oil Diff',
            'Running Hours',
            'Voltage',
            'Water Temp',
            'Static Press Reading',
            'Diff Press Reading',
        ];

        foreach ($fields as $fieldName) {
            ReportInputField::create([
                'field_name' => $fieldName,
                'field_value' => Str::slug($fieldName, '_'),
                'has_subfields' => false,
            ]);
        }

        $dischargeTemp = ReportInputField::create([
            'field_name' => 'Discharge Temp.',
            'field_value' => 'discharge_temp',
            'has_subfields' => true,
        ]);

        // Tambahkan subfields-nya
        $subfields = ['Bef. Cooler', 'Aft. Cooler'];
        foreach ($subfields as $subName) {
            ReportSubField::create([
                'main_field_id' => $dischargeTemp->id,
                'subfield_name' => $subName,
                'subfield_value' => Str::slug($subName, '_'),
            ]);
        }
    }
}

