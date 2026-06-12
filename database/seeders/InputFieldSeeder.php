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
            'Discharge Header Press',
            'Suction Press',
            'Discharge Press',
            'Speed',
            'Manifold Press',
            'Oil Press',
            'Oil Diff',
            'Running Hours',
            'Voltage',
            'Water Temp',
            'Discharge Temp.',
            'Static Press Reading',
            'Diff Press Reading',
            'Flowrate',
        ];

        foreach ($fields as $fieldName) {
            $field = DailyField::create([
                'name' => $fieldName,
                'slug' => Str::slug($fieldName, '_'),
            ]);

            if ($fieldName === 'Discharge Temp.') {
                foreach (['Bef. Cooler', 'Aft. Cooler'] as $subName) {
                    Subfield::create([
                        'field_id' => $field->id,
                        'name' => $subName,
                        'slug' => Str::slug($subName, '_'),
                    ]);
                }
            }
        }

        // $flowrate = DailyField::create([
        //     'name' => 'Flowrate',
        //     'slug' => 'flowrate',
        // ]);

        // $flowSubfields = ['MSCFD'];
        // foreach ($flowSubfields as $subName) {
        //     Subfield::create([
        //         'field_id' => $flowrate->id,
        //         'name' => $subName,
        //         'slug' => Str::slug($subName, '_'),
        //     ]);
        // }
    }
}

