<?php

namespace Database\Seeders;

use App\Models\DailyField;
use App\Models\Subfield;
use Illuminate\Database\Seeder;
use Str;

class InputFieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            'Source Press',
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
            DailyField::create([
                'name' => $fieldName,
                'slug' => Str::slug($fieldName, '_'),
            ]);
        }

        $dischargeTemp = DailyField::create([
            'name' => 'Discharge Temp.',
            'slug' => 'discharge_temp',
        ]);

        // Tambahkan subfields-nya
        $disTempSubfields = ['Bef. Cooler', 'Aft. Cooler'];
        foreach ($disTempSubfields as $subName) {
            Subfield::create([
                'field_id' => $dischargeTemp->id,
                'name' => $subName,
                'slug' => Str::slug($subName, '_'),
            ]);
        }

        $flowrate = DailyField::create([
            'name' => 'Flowrate',
            'slug' => 'flowrate',
        ]);

        $flowSubfields = ['MSCFD'];
        foreach ($flowSubfields as $subName) {
            Subfield::create([
                'field_id' => $flowrate->id,
                'name' => $subName,
                'slug' => Str::slug($subName, '_'),
            ]);
        }
    }
}

