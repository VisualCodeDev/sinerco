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
        Schema::create('workshop_units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workshop_id');
            $table->string('unit_id', 50);
            $table->timestamps();

            $table->unique(['workshop_id', 'unit_id']);

            $table->foreign('workshop_id')
                ->references('id')->on('workshops')
                ->onDelete('cascade');

            $table->foreign('unit_id')
                ->references('unitId')->on('data_units')
                ->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
