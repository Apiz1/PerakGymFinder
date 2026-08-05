<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // user | gym_owner | super_admin
            $table->timestamps();
        });

        // Seed the three roles immediately so foreign keys have something to point at
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'user', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'gym_owner', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'super_admin', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};