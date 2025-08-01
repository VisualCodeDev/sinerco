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
        Schema::create('report_sub_fields', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('main_field_id');
            $table->foreign('main_field_id')
                ->references('id')->on('report_input_fields')
                ->onDelete('cascade');
            $table->string('subfield_name');
            $table->string('subfield_value');
            $table->timestamps();

            $table->unique(['main_field_id', 'subfield_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_sub_fields');
    }
};
