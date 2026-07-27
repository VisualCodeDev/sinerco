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
        Schema::table('clients', function (Blueprint $table) {
            $table->enum('template_inv', ['1', '2', '3', '4'])->default('1')->nullable();
            $table->enum('template_ba', ['1', '2', '3', '4', '5'])->default('1')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('template_ba');
            $table->dropColumn('template_inv');
        });
    }
};
