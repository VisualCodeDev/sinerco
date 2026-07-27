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
        Schema::create('curves', function (Blueprint $table) {
            $table->id();
            $table->integer('suction_pressure');
            $table->integer('discharge_pressure');
            $table->string('valve');
            $table->decimal('flowrate', 8, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curves');
    }
};
