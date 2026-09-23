<?php

namespace App\Services;

use Carbon\Carbon;

// Hitung running/standby/down hours untuk sebuah unit pada tanggal tertentu berdasarkan
// daftar StatusRequest-nya. Dipakai bareng oleh ExportController (rekap bulanan/invoice)
// dan DailyReportController (proration performance per-jam berdasarkan runtime hari itu).
class UnitAvailabilityService
{
    /** Merge overlapping [start, end] (unix timestamp) pairs into non-overlapping ranges. */
    private static function mergeIntervals(array $intervals): array
    {
        if (empty($intervals)) {
            return [];
        }

        usort($intervals, fn($a, $b) => $a[0] <=> $b[0]);

        $merged = [$intervals[0]];
        foreach (array_slice($intervals, 1) as $interval) {
            $lastIndex = count($merged) - 1;
            if ($interval[0] <= $merged[$lastIndex][1]) {
                $merged[$lastIndex][1] = max($merged[$lastIndex][1], $interval[1]);
            } else {
                $merged[] = $interval;
            }
        }

        return $merged;
    }

    /** Remove any portion of $base intervals that falls inside $subtract intervals. */
    private static function subtractIntervals(array $base, array $subtract): array
    {
        foreach ($subtract as $sub) {
            $next = [];
            foreach ($base as $seg) {
                if ($sub[1] <= $seg[0] || $sub[0] >= $seg[1]) {
                    $next[] = $seg;
                    continue;
                }
                if ($sub[0] > $seg[0]) {
                    $next[] = [$seg[0], $sub[0]];
                }
                if ($sub[1] < $seg[1]) {
                    $next[] = [$sub[1], $seg[1]];
                }
            }
            $base = $next;
        }

        return $base;
    }

    // Jumlahkan total durasi (detik) dari kumpulan interval
    private static function intervalsDurationSeconds(array $intervals): int
    {
        return array_sum(array_map(fn($i) => $i[1] - $i[0], $intervals));
    }

    // Hitung status running/standby/down (jam) untuk satu tanggal berdasarkan daftar request
    public static function dailyStatus($requests, string $date): array
    {
        $dayStart = Carbon::parse($date)->startOfDay();
        // Batas akhir hari ini yang SEBENARNYA (00:00 hari berikutnya = "24:00"),
        // BUKAN endOfDay() (23:59:59.999999) -- endOfDay() bikin overlap yang
        // sampai lewat tengah malam (request multi-hari) kehilangan ~1 detik durasi
        // down/standby, dan remarks-nya salah nampilin "23:59" padahal seharusnya
        // "24:00" (masih lanjut sampai akhir hari, bukan berhenti semenit sebelumnya).
        $dayEnd = Carbon::parse($date)->addDay()->startOfDay();
        $downIntervals = [];
        $standbyIntervals = [];
        $remarksArr = [];

        foreach ($requests as $req) {
            $reqStart = Carbon::parse($req->start_date . ' ' . $req->start_time);
            $reqEnd = Carbon::parse($req->end_date . ' ' . $req->end_time);

            // skip jika request tidak overlap hari ini
            if ($reqEnd <= $dayStart || $reqStart >= $dayEnd) {
                continue;
            }

            // hitung overlap jam di hari ini
            $start = $reqStart->max($dayStart);
            $end = $reqEnd->min($dayEnd);

            // assign durasi (per interval, di-merge nanti supaya request yang overlap tidak dihitung dobel)
            if ($req->request_type === 'sd') {
                $downIntervals[] = [$start->timestamp, $end->timestamp];
            }
            if ($req->request_type === 'stdby') {
                $standbyIntervals[] = [$start->timestamp, $end->timestamp];
            }

            // remarks per hari disesuaikan dengan jam overlap -- kalau overlap-nya
            // berakhir persis di batas hari ini (request lanjut ke hari berikutnya),
            // tampilkan "24:00", bukan "00:00" (Carbon format H:i wrap ke 00:00
            // untuk tengah malam).
            $endLabel = $end->equalTo($dayEnd) ? '24:00' : $end->format('H:i');
            $remarksArr[] = sprintf(
                '%s - %s %s/ %s',
                $start->format('H:i'),
                $endLabel,
                strtoupper($req->type),
                $req->remarks
            );
        }

        // Gabungkan interval yang overlap dalam tipe yang sama, lalu prioritaskan 'sd' di atas 'stdby'
        // supaya rentang waktu yang sama tidak pernah dihitung dobel (down+standby tidak akan pernah > 24 jam/hari).
        $downIntervals = self::mergeIntervals($downIntervals);
        $standbyIntervals = self::subtractIntervals(self::mergeIntervals($standbyIntervals), $downIntervals);

        $downHours = round(self::intervalsDurationSeconds($downIntervals) / 3600, 2);
        $standbyHours = round(self::intervalsDurationSeconds($standbyIntervals) / 3600, 2);
        $runningHours = round(24 - ($downHours + $standbyHours), 2);

        return [
            'running' => max($runningHours, 0),
            'standby' => min(24, $standbyHours),
            'down' => min(24, $downHours),
            'remarks' => implode("\n", $remarksArr) // semua request hari ini
        ];
    }
}
