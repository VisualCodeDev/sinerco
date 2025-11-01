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
            $table->string('unit_id', 10)->primary();
            $table->string('unit');
            $table->string('unit_sn')->default('');
            $table->string('engine_sn')->default('');
            $table->string('office_size')->default('');
            $table->string('config')->default('');
            $table->enum('status', ['stdby', 'sd', 'running'])->default('running');
            $table->string('contract_ref')->default('0000000000');
            $table->string('application')->nullable();

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
