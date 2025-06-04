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
        Schema::create('daily_report_settings', function (Blueprint $table) {
            $table->id();
            $table->string('clientId', 50)->unique();
            $table->json('decimalSetting');
            $table->json('minMaxSetting');
            $table->timestamps();

            $table->foreign('clientId')->references('clientId')->on('clients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_report_settings');
    }
};
