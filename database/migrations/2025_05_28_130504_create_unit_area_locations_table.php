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
        Schema::create('unit_area_locations', function (Blueprint $table) {
            $table->id();
            $table->string('unitAreaLocationId', 50)->unique();
            $table->string('unitId', 50);
            $table->string('userId', 50);
            $table->string('area');
            $table->string('location');
            $table->timestamps();

            $table->foreign('userId')->references('userId')->on('user_data_units')->onDelete('cascade');
            $table->foreign('unitId')->references('unitId')->on('data_units')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_area_locations');
    }
};
