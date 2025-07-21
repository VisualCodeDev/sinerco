<?php

namespace Database\Seeders;

use App\Models\Role;
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
        $roles = Role::pluck('id', 'name');

        User::updateOrCreate(
            ['email' => 'feriyanto167@gmail.com'],
            [
                'name' => 'Feriyanto',
                'password' => Hash::make('password12345'),
                'role_id' => $roles['operator'] ?? null,
                // 'whatsAppNum' => '081359113349',
            ],
        );

        User::updateOrCreate(
            ['email' => 'ramadhans.businessmail@gmail.com'],
            [
                'name' => 'Rama',
                'password' => Hash::make('admin12345'),
                'role_id' => $roles['super_admin'] ?? null,
                'whatsAppNum' => '081359113349',
            ],
        );

        User::updateOrCreate(
            ['email' => 'johan@sinerco.co.id'],
            [
                'name' => 'Johan',
                'password' => Hash::make('admin12345'),
                'role_id' => $roles['super_admin'] ?? null,
                'whatsAppNum' => '082113837546',
            ],
        );

        User::updateOrCreate(
            ['email' => 'operator@sinerco.co.id'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('operator12345'),
                'role_id' => $roles['operator'] ?? null,
            ],
        );

        User::updateOrCreate(
            ['email' => 'teknisi@sinerco.co.id'],
            [
                'name' => 'Budi Kentaki',
                'password' => Hash::make('teknisi12345'),
                'role_id' => $roles['technician'] ?? null,
                'whatsAppNum' => '085921774621',
            ],
        );

        User::updateOrCreate(
            ['email' => 'client@sinerco.co.id'],
            [
                'name' => 'Client',
                'password' => Hash::make('client12345'),
                'role_id' => $roles['client'] ?? null,
            ],
        );

        User::updateOrCreate(
            ['email' => 'manager@sinerco.co.id'],
            [
                'name' => 'Manager',
                'password' => Hash::make('manager12345'),
                'role_id' => $roles['guest'] ?? null,
            ],
        );

        User::updateOrCreate(
            ['email' => 'general.manager@sinerco.co.id'],
            [
                'name' => 'General Manager',
                'password' => Hash::make('general.manager12345'),
                'role_id' => $roles['guest'] ?? null,
            ],
        );

        User::updateOrCreate(
            ['email' => 'direksi@sinerco.co.id'],
            [
                'name' => 'Direksi',
                'password' => Hash::make('direksi12345'),
                'role_id' => $roles['guest'] ?? null,
            ],
        );

        User::updateOrCreate(
            ['email' => 'testTeknisi@sinerco.co.id'],
            [
                'name' => 'Jono Santoso',
                'password' => Hash::make('direksi12345'),
                'whatsAppNum' => '081281995158',
                'role_id' => $roles['technician'] ?? null,
            ],
        );
    }

}
