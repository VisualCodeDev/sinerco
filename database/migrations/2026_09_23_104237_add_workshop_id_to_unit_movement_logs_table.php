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
        Schema::table('unit_movement_logs', function (Blueprint $table) {
            // Sama seperti from/to_client_id -- sengaja tanpa FK, ini log historis
            $table->string('from_workshop_id', 10)->nullable()->after('to_client_id');
            $table->string('to_workshop_id', 10)->nullable()->after('from_workshop_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_movement_logs', function (Blueprint $table) {
            $table->dropColumn(['from_workshop_id', 'to_workshop_id']);
        });
    }
};
