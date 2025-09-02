<?php

namespace Database\Seeders;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Str;

class ClientSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $clients = [
            'PHE ONWJ',
            'PEP Tambun',
            'PEP Subang',
            'PEP Jatibarang',
            'MEDCO (Tarakan)',
            'MEDCO (Rimau)',
            'PEP Sangasanga',
            'PEP Adera',
            'PEP Limau',
            'EMP Riau',
            'PEP Prabumulih',
        ];

        foreach ($clients as $client) {
            Client::updateOrCreate(
                ['name' => $client],
            );
        }
    }
}
