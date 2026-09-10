<?php

namespace App\Services;

use App\Models\UnitMovementLog;
use App\Models\UnitPosition;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

// Dipakai di setiap endpoint yang mengubah client_id/region_id/location_id sebuah
// unit_position (assign/unassign client, relocate, dsb) supaya tiap perubahan
// tercatat sebagai riwayat -- bukan cuma nilai terakhir yang tersimpan.
//
// Pola pakainya 2 langkah karena semua endpoint itu meng-update lewat query
// builder (UnitPosition::whereIn(...)->update(...)), bukan model instance, jadi
// kondisi "sebelum" harus diambil manual sebelum update dijalankan:
//
//   $before = UnitMovementLogger::snapshot($unitIds);
//   UnitPosition::whereIn('unit_id', $unitIds)->update([...]);
//   UnitMovementLogger::commit($before, 'assign_client');
class UnitMovementLogger
{
    /** Ambil kondisi posisi unit-unit SEBELUM diupdate. */
    public static function snapshot(array $unitIds): Collection
    {
        return UnitPosition::whereIn('unit_id', $unitIds)->get()->keyBy('unit_id');
    }

    /**
     * Bandingkan snapshot sebelum vs kondisi sekarang di DB, simpan 1 baris log
     * per unit yang client_id/region_id/location_id-nya benar-benar berubah.
     */
    public static function commit(Collection $before, string $action, ?string $note = null): void
    {
        if ($before->isEmpty()) {
            return;
        }

        $unitIds = $before->keys()->all();
        $after = UnitPosition::whereIn('unit_id', $unitIds)->get()->keyBy('unit_id');
        $userId = Auth::user()?->user_id;

        foreach ($after as $unitId => $pos) {
            $prev = $before->get($unitId);
            if (!$prev) {
                continue;
            }

            $changed = $prev->client_id !== $pos->client_id
                || $prev->region_id !== $pos->region_id
                || $prev->location_id !== $pos->location_id;

            if (!$changed) {
                continue;
            }

            UnitMovementLog::create([
                'unit_id' => $unitId,
                'action' => $action,
                'from_client_id' => $prev->client_id,
                'to_client_id' => $pos->client_id,
                'from_region_id' => $prev->region_id,
                'to_region_id' => $pos->region_id,
                'from_location_id' => $prev->location_id,
                'to_location_id' => $pos->location_id,
                'changed_by' => $userId,
                'note' => $note,
            ]);
        }
    }

    /** Log 1 unit baru dibuat & langsung ditempatkan (tidak ada kondisi "sebelum"). */
    public static function logCreated(UnitPosition $position, ?string $note = null): void
    {
        UnitMovementLog::create([
            'unit_id' => $position->unit_id,
            'action' => 'created',
            'from_client_id' => null,
            'to_client_id' => $position->client_id,
            'from_region_id' => null,
            'to_region_id' => $position->region_id,
            'from_location_id' => null,
            'to_location_id' => $position->location_id,
            'changed_by' => Auth::user()?->user_id,
            'note' => $note,
        ]);
    }
}
