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
        Schema::create('daily_reports', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->date('date');
            $table->string('time');
            $table->float('sourcePress');
            $table->float('suctionPress');
            $table->float('dischargePress');
            $table->float('speed');
            $table->float('manifoldPress');
            $table->float('oilPress');
            $table->float('oilDiff');
            $table->float('runningHours');
            $table->float('voltage');
            $table->float('waterTemp');
            $table->float('befCooler');
            $table->float('aftCooler');
            $table->float('staticPress');
            $table->float('diffPress');
            $table->float('mscfd');
            $table->boolean('approval1')->default(false);
            $table->boolean('approval2')->default(false);
            $table->unique(['date', 'time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_reports');
    }
};
