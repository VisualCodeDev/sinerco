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
            $table->string('workshop_id', 10);
            $table->string('unit_id', 10);
            $table->timestamps();

            $table->unique(['workshop_id', 'unit_id']);

            $table->foreign('workshop_id')
                ->references('workshop_id')->on('workshops')
                ->onDelete('cascade');

            $table->foreign('unit_id')
                ->references('unit_id')->on('data_units')
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
