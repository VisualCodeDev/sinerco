<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_units', function (Blueprint $table) {
            $table->string('old_sn')->default('')->after('unit_sn');
        });
    }

    public function down(): void
    {
        Schema::table('data_units', function (Blueprint $table) {
            $table->dropColumn('old_sn');
        });
    }
};
