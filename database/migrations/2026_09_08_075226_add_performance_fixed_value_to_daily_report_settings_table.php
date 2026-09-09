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
        Schema::table('daily_report_settings', function (Blueprint $table) {
            // Kalau diisi, dipakai sebagai pembagi performance_24h menggantikan curve_24h.
            // Kosong (null) berarti tetap pakai perhitungan curve seperti biasa.
            $table->decimal('performanceFixedValue', 10, 2)->nullable()->after('unitSetting');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_report_settings', function (Blueprint $table) {
            $table->dropColumn('performanceFixedValue');
        });
    }
};
