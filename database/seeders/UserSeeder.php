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
            [
                'email' => 'ramadhans.businessmail@gmail.com'
            ],
            [
                'name' => 'Rama',
                'password' => Hash::make('admin12345'),
                'role' => 'super_admin',
                'whatsAppNum' => '081359113349'
            ],
        );
        User::updateOrCreate(
            ['email' => 'johan@sinerco.co.id'],
            [
                'name' => 'Johan',
                'password' => Hash::make('admin12345'),
                'role' => 'super_admin',
                'whatsAppNum' => '082113837546'
            ],
        );
        User::updateOrCreate(
            ['email' => 'operator@sinerco.co.id'],
            [
                'name' => 'Operator',
                'password' => Hash::make('operator12345'),
                'role' => 'operator',
            ],
        );
        User::updateOrCreate(
            ['email' => 'teknisi@sinerco.co.id'],
            [
                'name' => 'Teknisi',
                'password' => Hash::make('teknisi12345'),
                'role' => 'technition',
            ],
        );
        User::updateOrCreate(
            ['email' => 'client@sinerco.co.id'],
            [
                'name' => 'Client',
                'password' => Hash::make('client12345'),
                'role' => 'client',
            ],
        );
        User::updateOrCreate(
            ['email' => 'manager@sinerco.co.id'],
            [
                'name' => 'Manager',
                'password' => Hash::make('manager12345'),
                'role' => 'guest',
            ],
        );
         User::updateOrCreate(
            ['email' => 'general.manager@sinerco.co.id'],
            [
                'name' => 'General Manager',
                'password' => Hash::make('general.manager12345'),
                'role' => 'guest',
            ],
        );
        User::updateOrCreate(
            ['email' => 'direksi@sinerco.co.id'],
            [
                'name' => 'direksi',
                'password' => Hash::make('direksi12345'),
                'role' => 'guest',
            ],
        );
    }
}
