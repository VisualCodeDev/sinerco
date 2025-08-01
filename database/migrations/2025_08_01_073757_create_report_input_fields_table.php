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
        Schema::create('report_input_fields', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('unit_id')->constrained()->onDelete('cascade');
            $table->string('field_name')->unique();
            $table->string('field_value');
            $table->boolean('has_subfields')->default(false);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_input_fields');
    }
};
