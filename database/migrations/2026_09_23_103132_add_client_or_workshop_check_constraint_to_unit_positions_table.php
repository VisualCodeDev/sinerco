<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Sebuah unit_position cuma boleh ditempatkan di salah satu, client ATAU workshop,
// tidak boleh dua-duanya sekaligus. Sudah dijaga di level aplikasi (addUnitLocation,
// updateUnitFull, dll), tapi CHECK constraint ini jadi jaring pengaman terakhir di
// level DB kalau ada jalur lain yang lolos.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Bersihkan dulu baris yang sudah kepalang melanggar (kalau ada) sebelum
        // constraint-nya ditambahkan, supaya ALTER TABLE-nya tidak gagal -- client_id
        // dipertahankan, workshop_id yang di-null-kan.
        DB::statement('UPDATE unit_positions SET workshop_id = NULL WHERE client_id IS NOT NULL AND workshop_id IS NOT NULL');

        DB::statement('ALTER TABLE unit_positions ADD CONSTRAINT chk_client_or_workshop CHECK (client_id IS NULL OR workshop_id IS NULL)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE unit_positions DROP CONSTRAINT chk_client_or_workshop');
    }
};
