<?php

namespace App\Http\Controllers;

use App\Models\UnitPosition;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Date;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    // Kirim pesan WhatsApp otomatis berisi laporan unit harian untuk sebuah client
    public function sendAutoMessage($clientId)
    {
        // Tanggal hari ini, dipakai untuk filter report & request
        $currentDate = Carbon::today();

        // Ambil semua unit posisi milik client beserta relasi terkait
        $unitReports = UnitPosition::select('id', 'location_id', 'unit_id', 'client_id')
            ->where('client_id', $clientId)
            ->with([
                'workers.user',
                'reports' => function ($query) use ($currentDate) {
                    $query->whereDate('date', $currentDate);
                },
                'requests' => function ($query) use ($currentDate) {
                    $query->whereDate('start_date', $currentDate);
                },
                'location',
                'unit',
                'client'
            ])
            ->get();


        // Loop tiap unit untuk membuat pesan report masing-masing
        foreach ($unitReports as $unitReport) {
            $client = $unitReport->client ?? null;
            // Interval jam pengisian report (default tiap 1 jam)
            $input_interval = $client->input_interval ?? 1;

            $reports = $unitReport->reports ?? collect();
            // Petakan report berdasarkan jam (time) agar mudah dicari
            $reportMap = $reports->mapWithKeys(function ($r) {
                return [$r->time => $r->data];
            });

            // Ambil field dari salah satu report (kalau ada)
            if ($reportMap->isNotEmpty()) {
                $sample = collect($reportMap->first());
                $fields = $sample->keys()->reject(fn($key) => in_array($key, ['date', 'time']))->values();
            } else {
                // Kalau gak ada report, buat field kosong aja
                $fields = collect();
            }

            // Header pesan berisi daftar nama field report
            $header = 'TIME : ' . (
                $fields->isNotEmpty()
                ? $fields->map(fn($f) => ucwords(str_replace('_', ' ', $f)))->implode(' | ')
                : ''
            );

            // isi report tiap jam
            $lines = [];
            for ($i = 1 + ($input_interval - 1); $i <= 24; $i += $input_interval) {
                $time = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
                $data = $reportMap[$time] ?? null;

                if ($data) {
                    // Jaga-jaga kalau ada data lama yang ke-double-encode (masih string JSON)
                    if (is_string($data)) {
                        $data = json_decode($data, true) ?? [];
                    }
                    unset($data['date'], $data['time']);
                    $values = array_values($data);
                    $lines[] = $time . '/' . implode('/', $values);
                } else {
                    $lines[] = $time . '/';
                }
            }

            // isi request
            $requests = $unitReport->requests ?? collect();
            // Gabungkan semua remarks dari request menjadi bullet list
            $remarksList = $requests
                ->pluck('remarks')
                ->filter() // buang null / kosong
                ->map(fn($r) => "• " . trim($r))
                ->implode("\n");

            if ($remarksList === '') {
                $remarksList = "• No remarks available";
            }

            $formattedReports = implode("\n", $lines);

            $unit = $unitReport->unit->unit ?? '';
            $engine_sn = $unitReport->unit->engine_sn ?? '';


            // NOMOR TELEPON
            $workers = $unitReport->workers ?? collect();
            // Ambil daftar nomor WhatsApp pekerja untuk tujuan kirim pesan
            $phoneNumberList = $workers->pluck('user.whatsAppNum')
                ->filter()
                ->values()
                ->toArray();
            ;
            // PESAN
            $message = <<<TEXT
            *$unit*
            *$header*

            $formattedReports

            Remaks :
            ($unit) $engine_sn
            $remarksList
            TEXT;

            // Log::debug($unitReport);
            // Kirim pesan hanya jika ada nomor tujuan
            if (count($phoneNumberList) > 0) {
                Log::debug($message);
                WhatsAppService::sendMessage(implode(', ', $phoneNumberList), $message);
            }
        }
        // $phone = '081281995158';

    }
}
