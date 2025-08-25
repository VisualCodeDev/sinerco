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
        // Schema::table('status_requests', function (Blueprint $table) {
        //     $table->unsignedBigInteger('daily_report_id')->nullable();
        //     $table->string('unitAreaLocationId');

        //     $table->foreign('daily_report_id')->references('id')->on('daily_reports')->onDelete('cascade');
        //     $table->foreign('unitAreaLocationId')->references('unitAreaLocationId')->on('unit_area_locations')->onDelete('cascade');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('status_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('locationId');
            $table->string('unitId', 50);

        });
    }
};
