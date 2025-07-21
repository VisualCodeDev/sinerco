<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $roles = [
            'guest',
            'operator',
            'technician',
            'super_admin',
            'client',
            'workshop',
        ];
        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role],
            );
        }
    }
}
