<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'super_admin')->firstOrFail();

        User::updateOrCreate(
            ['email' => 'admin@gymfinder.my'], // change this to your real email
            [
                'role_id' => $superAdminRole->id,
                'name' => 'Super Admin',
                'password' => Hash::make('password'), // change this before running in production
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}