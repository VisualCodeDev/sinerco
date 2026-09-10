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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            // 1 unit_position = 1 kontrak aktif. Nempel ke unit_position (bukan
            // unit_id) karena kontrak itu perjanjian dengan client tertentu saat ini
            // -- kalau unit dipindah ke client lain, itu jadi kontrak baru.
            $table->unsignedBigInteger('unit_position_id')->unique();
            $table->string('contract_number')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'expired', 'terminated'])->default('active');
            // Cuma simpan PATH-nya di sini, bukan isi file-nya -- file PDF asli
            // disimpan di storage/app/public, jadi baca data kontrak tetap ringan
            // dan tidak ikut nge-load isi PDF-nya kecuali memang mau di-download.
            $table->string('document_path')->nullable();
            $table->timestamps();

            $table->foreign('unit_position_id')->references('id')->on('unit_positions')->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
