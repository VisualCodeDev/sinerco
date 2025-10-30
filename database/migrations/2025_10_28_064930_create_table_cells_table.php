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
        Schema::create('table_cells', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('daily_report_id');
            $table->string('parameter'); // misal: 'sourcePress', 'oilPress', dll
            $table->float('value')->nullable();
            $table->string('unit')->nullable(); // misal: 'psi', 'bar', '°C'
            $table->string('cell');
            $table->timestamps();

            $table->foreign('daily_report_id')->references('id')->on('daily_reports')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_cells');
    }
};
