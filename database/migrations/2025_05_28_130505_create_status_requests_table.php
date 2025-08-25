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
        Schema::create('status_requests', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('requestId')->unique();
            $table->unsignedBigInteger('requestedBy');
            $table->string('unitAreaLocationId');
            $table->date('startDate');
            $table->string('startTime');
            $table->date('endDate')->nullable();
            $table->string('endTime')->default('')->nullable();
            $table->string('requestType');
            $table->string('action')->default('');
            $table->string('remarks')->default('');
            $table->enum('status', ['Ongoing', 'End'])->default('Ongoing');
            $table->boolean('seenStatus')->default(false);
            $table->time('seenTime')->nullable();
            $table->unsignedBigInteger('seenBy')->nullable();

            $table->unique(['unitAreaLocationId', 'startDate', 'startTime']);
            $table->foreign('seenBy')->references('id')->on('users')->onUpdate('CASCADE')->onDelete('CASCADE');
            $table->foreign('requestedBy')->references('id')->on('users')->onUpdate('CASCADE')->onDelete('CASCADE');
            $table->foreign('unitAreaLocationId')->references('unitAreaLocationId')->on('unit_area_locations')->onUpdate('CASCADE')->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_requests');
    }
};
