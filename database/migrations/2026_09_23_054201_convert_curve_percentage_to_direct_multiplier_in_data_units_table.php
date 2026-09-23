<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// curve_percentage berubah makna: dari "penyesuaian +/- di sekitar baseline 100%"
// (curve_24h = curve * (100 + persen) / 100, default 0 = curve penuh) jadi
// "persentase langsung 0-100% dari variable curve" (curve_24h = curve * persen / 100,
// default 100 = curve penuh) -- supaya angka yang SUDAH ada tetap menghasilkan
// curve_24h yang sama, nilai lama dikonversi: baru = 100 + lama (clamp 0-100).
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('UPDATE data_units SET curve_percentage = LEAST(100, GREATEST(0, 100 + curve_percentage))');

        Schema::table('data_units', function (Blueprint $table) {
            $table->decimal('curve_percentage', 5, 2)->default(100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_units', function (Blueprint $table) {
            $table->decimal('curve_percentage', 5, 2)->default(0)->change();
        });

        DB::statement('UPDATE data_units SET curve_percentage = curve_percentage - 100');
    }
};
