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
        Schema::create('data_units', function (Blueprint $table) {
            $table->string('unitId', 50)->unique()->primary();
            $table->string('unit');
            $table->enum('status', ['stdby', 'sd', 'running'])->default('running');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_units');
    }
};
