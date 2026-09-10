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
        Schema::create('unit_movement_logs', function (Blueprint $table) {
            $table->id();
            $table->string('unit_id', 10);
            // Jenis perubahan -- dipakai buat label di timeline (mis. "Assigned to client",
            // "Relocated", "Unassigned from client"), bukan buat logic apa pun.
            $table->string('action', 40);

            // Snapshot sebelum & sesudah. Sengaja TIDAK pakai foreign key ke
            // clients/regions/locations -- ini log historis, kalau client/area/location-nya
            // sendiri dihapus di kemudian hari, catatan pergerakan unit ini tetap harus ada.
            $table->string('from_client_id', 10)->nullable();
            $table->string('to_client_id', 10)->nullable();
            $table->unsignedBigInteger('from_region_id')->nullable();
            $table->unsignedBigInteger('to_region_id')->nullable();
            $table->unsignedBigInteger('from_location_id')->nullable();
            $table->unsignedBigInteger('to_location_id')->nullable();

            $table->string('changed_by', 10)->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('unit_id')->on('data_units')->onDelete('cascade');
            $table->index('unit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_movement_logs');
    }
};
