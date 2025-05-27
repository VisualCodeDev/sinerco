<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@sinerco.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin_sinerco'),
            ],
        );
        User::updateOrCreate(
            ['email' => 'rama@sinerco.com'],
            [
                'name' => 'Rama',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
            ],
        );
    }
}
