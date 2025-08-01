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
        Schema::create('data_unit_field', function (Blueprint $table) {
            $table->id();

            $table->string('unit_id', 50);
            $table->unsignedBigInteger('field_id');
            $table->boolean('isRequired')->default(false);

            $table->foreign('unit_id')
                ->references('unitId')->on('data_units')
                ->onDelete('cascade');

            $table->foreign('field_id')
                ->references('id')->on('report_input_fields')
                ->onDelete('cascade');
            $table->unique(["unit_id", 'field_id']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_unit_field');
    }
};
