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
        Schema::create('berita_acaras', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('unit_position_id')->unique();
            $table->string('pic_name')->nullable();
            $table->string('pic_department')->nullable();
            $table->string('spv_name')->nullable();
            $table->string('spv_department')->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_department')->nullable();

            $table->foreign('unit_position_id')->references('id')->on('unit_positions')->onUpdate('CASCADE')->onDelete('CASCADE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berita_acaras');
    }
};
