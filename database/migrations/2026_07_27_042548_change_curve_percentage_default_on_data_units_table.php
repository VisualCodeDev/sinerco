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
            $table->decimal('curve_percentage', 5, 2)->default(0)->change();
        });

        // 100 was the old "no adjustment" default; 0 is the new "no adjustment" default.
        DB::table('data_units')->where('curve_percentage', 100)->update(['curve_percentage' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('data_units')->where('curve_percentage', 0)->update(['curve_percentage' => 100]);

        Schema::table('data_units', function (Blueprint $table) {
            $table->decimal('curve_percentage', 5, 2)->default(100)->change();
        });
    }
};
