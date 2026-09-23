<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// performanceFixedValue direname jadi curveFixedValue -- field ini secara konsep
// bukan "performance yang fixed", tapi "referensi/curve yang fixed" (dipakai
// sebagai pembagi langsung di calculatePerformance(), gantiin curve_24h).
// Pakai CHANGE (bukan RENAME COLUMN) karena servernya MariaDB 10.4, yang belum
// dukung syntax RENAME COLUMN (baru ada di MariaDB 10.5.2+ / MySQL 8+).
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE data_units CHANGE performanceFixedValue curveFixedValue DECIMAL(10,2) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE data_units CHANGE curveFixedValue performanceFixedValue DECIMAL(10,2) NULL');
    }
};
