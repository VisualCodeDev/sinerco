<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userId');
            $table->string('unitAreaLocationId', 50);
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('unitAreaLocationId')->references('unitAreaLocationId')->on('unit_area_locations')->onDelete('cascade');
            $table->unique(['userId', 'unitAreaLocationId'], 'user_unit_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_allocations');
    }
};
