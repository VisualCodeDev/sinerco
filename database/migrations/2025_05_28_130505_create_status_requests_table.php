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
            $table->uuid('request_id')->primary();
            $table->unsignedBigInteger('unit_position_id');
            $table->date('start_date');
            $table->string('start_time');
            $table->date('end_date')->nullable();
            $table->string('end_time')->default('')->nullable();
            $table->string('request_type');
            $table->string('action')->default('');
            $table->string('remarks')->default('');
            $table->enum('status', ['Ongoing', 'End'])->default('Ongoing');
            $table->boolean('seen_status')->default(false);
            $table->time('seen_time')->nullable();
            $table->string('requested_by', 10);
            $table->string('seen_by', 10)->nullable();
            $table->timestamps();

            $table->unique(['unit_position_id', 'start_date', 'start_time']);
            $table->foreign('seen_by')->references('user_id')->on('users')->onUpdate('CASCADE')->onDelete('CASCADE');
            $table->foreign('requested_by')->references('user_id')->on('users')->onUpdate('CASCADE')->onDelete('CASCADE');
            $table->foreign('unit_position_id')->references('id')->on('unit_positions')->onUpdate('CASCADE')->onDelete('CASCADE');
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
