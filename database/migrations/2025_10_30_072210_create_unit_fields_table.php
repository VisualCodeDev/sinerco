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
        Schema::create('unit_fields', function (Blueprint $table) {
            $table->id();
            $table->string('unit_id', 10);
            $table->unsignedBigInteger('field_id');
            $table->integer('column');
            $table->unique(['unit_id', 'field_id']);
            $table->unique(['unit_id', 'column']);
            $table->boolean('required')->default(true);

            $table->foreign('unit_id')->references('unit_id')->on('data_units')->onDelete('CASCADE')->onUpdate('CASCADE');
            $table->foreign('field_id')->references('id')->on('daily_fields')->onDelete('CASCADE')->onUpdate('CASCADE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_fields');
    }
};
