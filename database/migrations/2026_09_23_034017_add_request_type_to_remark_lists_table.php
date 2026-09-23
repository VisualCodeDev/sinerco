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
        Schema::table('remark_lists', function (Blueprint $table) {
            // Array of request types this remark applies to: sd, stdby, note (a remark can belong to more than one)
            $table->json('request_type')->nullable()->after('remark');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('remark_lists', function (Blueprint $table) {
            $table->dropColumn('request_type');
        });
    }
};
