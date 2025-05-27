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
        Schema::create('status_requests', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('requestId')->unique();
            $table->date('date');
            $table->string('timeStart');
            $table->string('timeEnd')->default('')->nullable();
            $table->string('requestType');
            $table->string('action')->default('');
            $table->string('remark')->default('');
            $table->string('status');
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
