<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\UserDataUnit;
use Illuminate\Database\Seeder;
use Str;

class UserDataUnitSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            'PHE ONWJ',
            'PEP Tambun',
            'PEP Subang',
            'PEP Jatibarang',
            'MEDCO',
            'PEP Sangasanga',
            'PEP Adera',
            'PEP Limau',
            'EMP Riau',
            'PEP Prabumulih',
        ];

        foreach ($users as $user) {
            UserDataUnit::updateOrCreate(
                ['user' => $user],
                ['userId' => (string) Str::uuid()]
            );
        }
    }
}
