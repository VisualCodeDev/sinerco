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
        Schema::create('unit_positions', function (Blueprint $table) {
            $table->id();
            $table->string('unit_id', 10);
            $table->enum('position_type', ['client', 'workshop']);
            $table->string('client_id', 10)->nullable();
            $table->string('workshop_id', 10)->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('unit_id')->on('data_units')->onDelete('cascade');
            $table->foreign('client_id')->references('client_id')->on('clients')->onDelete('cascade');
            $table->foreign('workshop_id')->references('workshop_id')->on('workshops')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');

            $table->unique('unit_id');
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
