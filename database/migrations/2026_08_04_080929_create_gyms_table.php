<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gyms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('address', 500);
            $table->foreignId('state_id')->constrained();
            $table->foreignId('district_id')->constrained();
            $table->foreignId('city_id')->constrained();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('whatsapp_number', 20)->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('google_place_id')->nullable()->unique();
            $table->string('google_maps_url', 500)->nullable();
            $table->enum('source', ['scraped', 'owner_submitted'])->default('scraped');
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->decimal('average_rating', 2, 1)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->unsignedInteger('total_views')->default(0);
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gyms');
    }
};