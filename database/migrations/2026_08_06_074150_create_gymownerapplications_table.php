<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gym_owner_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // applicant
            $table->foreignId('gym_id')->nullable()->constrained()->nullOnDelete(); // set if claiming an existing scraped gym
            $table->json('proposed_gym_details')->nullable(); // set if submitting a brand-new gym (name/address/location/contact)
            $table->string('business_doc_path', 500)->nullable(); // SSM/registration doc for admin verification
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete(); // admin who actioned it
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gym_owner_applications');
    }
};