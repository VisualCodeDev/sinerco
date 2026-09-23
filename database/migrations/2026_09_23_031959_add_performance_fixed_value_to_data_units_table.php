<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('data_units', function (Blueprint $table) {
            // Pindah dari client-level (daily_report_settings.performanceFixedValue)
            // ke per-unit -- fisik nilai fixed curve ini beda-beda tiap unit
            // (compressor), bukan satu nilai yang sama buat semua unit di 1 client.
            // Ditaruh di sebelah curve_percentage karena sama-sama bagian dari
            // perhitungan performance/curve unit.
            $table->decimal('performanceFixedValue', 10, 2)->nullable()->after('curve_percentage');
        });

        // Migrasikan nilai yang sudah pernah di-set per client ke SEMUA unit di
        // bawah client itu, supaya tidak hilang begitu saja.
        if (Schema::hasColumn('daily_report_settings', 'performanceFixedValue')) {
            $settings = DB::table('daily_report_settings')
                ->whereNotNull('performanceFixedValue')
                ->where('performanceFixedValue', '>', 0)
                ->get(['client_id', 'performanceFixedValue']);

            foreach ($settings as $setting) {
                $unitIds = DB::table('unit_positions')
                    ->where('client_id', $setting->client_id)
                    ->pluck('unit_id');

                if ($unitIds->isNotEmpty()) {
                    DB::table('data_units')
                        ->whereIn('unit_id', $unitIds)
                        ->update(['performanceFixedValue' => $setting->performanceFixedValue]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_units', function (Blueprint $table) {
            $table->dropColumn('performanceFixedValue');
        });
    }
};
