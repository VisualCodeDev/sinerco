<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curve extends Model
{
    // kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'suction_pressure',
        'discharge_pressure',
        'valve',
        'flowrate',
    ];

    // cast flowrate menjadi decimal 2 digit
    protected $casts = [
        'flowrate' => 'decimal:2',
    ];

    /**
     * Bilinear interpolation over (suction_pressure, discharge_pressure) for a given valve config.
     */
    public static function interpolate(float $suctionPressure, float $dischargePressure, string $valve): ?float
    {
        $rows = static::where('valve', $valve)->get(['suction_pressure', 'discharge_pressure', 'flowrate']);

        if ($rows->isEmpty()) {
            return null;
        }

        // kelompokkan baris berdasarkan discharge_pressure
        $dischargeGroups = $rows->groupBy('discharge_pressure');
        $dischargePressures = $dischargeGroups->keys()->map(fn($v) => (float) $v)->sort()->values();

        // cari batas bawah & atas discharge_pressure yang mengapit nilai target
        [$dpLow, $dpHigh] = self::bracket($dischargePressures, $dischargePressure);

        $flowAtDpLow = self::interpolateBySuction($dischargeGroups->get((int) $dpLow), $suctionPressure);
        $flowAtDpHigh = $dpHigh === $dpLow
            ? $flowAtDpLow
            : self::interpolateBySuction($dischargeGroups->get((int) $dpHigh), $suctionPressure);

        if ($flowAtDpLow === null || $flowAtDpHigh === null) {
            return null;
        }

        // interpolasi linear antar dua titik discharge_pressure
        return $dpHigh === $dpLow
            ? $flowAtDpLow
            : self::lerp($dischargePressure, $dpLow, $flowAtDpLow, $dpHigh, $flowAtDpHigh);
    }

    private static function interpolateBySuction($rowsForDischarge, float $suctionPressure): ?float
    {
        if (!$rowsForDischarge || $rowsForDischarge->isEmpty()) {
            return null;
        }

        $sorted = $rowsForDischarge->sortBy('suction_pressure')->values();
        $suctionValues = $sorted->pluck('suction_pressure')->map(fn($v) => (float) $v);

        [$spLow, $spHigh] = self::bracket($suctionValues, $suctionPressure);

        $rowLow = $sorted->first(fn($r) => (float) $r->suction_pressure === $spLow);
        $rowHigh = $sorted->first(fn($r) => (float) $r->suction_pressure === $spHigh);

        if (!$rowLow || !$rowHigh) {
            return null;
        }

        return $spLow === $spHigh
            ? (float) $rowLow->flowrate
            : self::lerp($suctionPressure, $spLow, (float) $rowLow->flowrate, $spHigh, (float) $rowHigh->flowrate);
    }

    /** Find the two breakpoints surrounding $target, clamped to the ends of $sortedValues. */
    private static function bracket($sortedValues, float $target): array
    {
        $values = $sortedValues->values();

        if ($target <= $values->first()) {
            return [$values->first(), $values->first()];
        }

        if ($target >= $values->last()) {
            return [$values->last(), $values->last()];
        }

        foreach ($values as $i => $value) {
            if ($value >= $target) {
                return [$values[$i - 1], $value];
            }
        }

        return [$values->last(), $values->last()];
    }

    private static function lerp(float $x, float $x0, float $y0, float $x1, float $y1): float
    {
        return $x1 === $x0 ? $y0 : $y0 + ($x - $x0) / ($x1 - $x0) * ($y1 - $y0);
    }
}
