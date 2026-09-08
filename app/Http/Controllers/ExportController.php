<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use Carbon\CarbonPeriod;
use Carbon\Carbon;
use App\Models\UnitPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;
use PhpOffice\PhpWord\TemplateProcessor;


class ExportController extends Controller
{
    /** Merge overlapping [start, end] (unix timestamp) pairs into non-overlapping ranges. */
    private function mergeIntervals(array $intervals): array
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
    private function subtractIntervals(array $base, array $subtract): array
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
    private function intervalsDurationSeconds(array $intervals): int
    {
        return array_sum(array_map(fn($i) => $i[1] - $i[0], $intervals));
    }

    // Hitung status running/standby/down (jam) untuk satu tanggal berdasarkan daftar request
    private function calculateDailyStatus($requests, string $date)
    {
        $dayStart = Carbon::parse($date)->startOfDay();
        $dayEnd = Carbon::parse($date)->endOfDay();
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

            // remarks per hari disesuaikan dengan jam overlap
            $remarksArr[] = sprintf(
                '%s - %s %s/ %s',
                $start->format('H:i'),
                $end->format('H:i'),
                strtoupper($req->type),
                $req->remarks
            );
        }

        // Gabungkan interval yang overlap dalam tipe yang sama, lalu prioritaskan 'sd' di atas 'stdby'
        // supaya rentang waktu yang sama tidak pernah dihitung dobel (down+standby tidak akan pernah > 24 jam/hari).
        $downIntervals = $this->mergeIntervals($downIntervals);
        $standbyIntervals = $this->subtractIntervals($this->mergeIntervals($standbyIntervals), $downIntervals);

        $downHours = round($this->intervalsDurationSeconds($downIntervals) / 3600, 2);
        $standbyHours = round($this->intervalsDurationSeconds($standbyIntervals) / 3600, 2);
        $runningHours = round(24 - ($downHours + $standbyHours), 2);

        return [
            'running' => max($runningHours, 0),
            'standby' => min(24, $standbyHours),
            'down' => min(24, $downHours),
            'remarks' => implode("\n", $remarksArr) // semua request hari ini
        ];
    }

    // Hitung rata-rata availability harian untuk rentang tanggal (default: bulan berjalan)
    private function calculateAvailabilityByRange($requests, array $rangeDate = null)
    {
        if (empty($rangeDate)) {
            // default range = bulan ini jika tidak ada rangeDate diberikan
            $year = now()->year;
            $month = now()->month;

            $rangeDate = [
                'start' => Carbon::create($year, $month, 1)->startOfMonth(),
                'end' => Carbon::create($year, $month, 1)->endOfMonth()
            ];
        }

        $period = CarbonPeriod::create(
            $rangeDate['start'],
            $rangeDate['end']
        );

        $dailyResults = [];
        $availabilitySum = 0;
        $daysCount = 0;

        // loop tiap hari dalam rentang, hitung availability per hari
        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $status = $this->calculateDailyStatus($requests, $dateStr);
            $availability = round(($status['running'] / 24) * 100, 2);

            $dailyResults[$dateStr] = [
                'running' => $status['running'],
                'standby' => $status['standby'],
                'down' => $status['down'],
                'availability' => $availability,
                'remarks' => $status['remarks']
            ];

            $availabilitySum += $availability;
            $daysCount++;
        }

        return [
            'daily' => $dailyResults,
            'average_availability' => $daysCount > 0
                ? round($availabilitySum / $daysCount, 2)
                : 0,
        ];
    }

    // Hitung rata-rata nilai $field per jam dalam rentang waktu tertentu
    private function getAvgByHourRange($reports, string $field, array $range = null)
    {
        $reports = collect($reports);
        if (empty($range)) {

            if ($reports->isEmpty()) {
                return 0;
            }

            $firstDate = Carbon::parse($reports->first()['date']);

            $range = [
                'start' => $firstDate->copy()->startOfDay(),
                'end' => $firstDate->copy()->endOfDay(),
            ];
        }

        // total semua nilai
        $total = $reports
            ->filter(function ($r) use ($field, $range) {
                if (!isset($r[$field], $r['date'], $r['time'])) {
                    return false;
                }
                $dt = Carbon::parse($r['date'] . ' ' . $r['time']);

                return is_numeric($r[$field])
                    && $dt >= Carbon::parse($range['start'])
                    && $dt <= Carbon::parse($range['end']);
            })
            ->sum(fn($r) => (float) $r[$field]);

        $startDate = Carbon::parse($range['start'])->startOfDay();
        $endDate = Carbon::parse($range['end'])->endOfDay();

        $hours = $startDate->diffInHours($endDate);
        $hours = (int) round($hours);

        return $hours > 0 ? $total / $hours : 0;
    }

    // Generate dokumen BAP (Berita Acara Pekerjaan) dari template docx sesuai jenis template
    public function exportBap($client_name, $client_department, $client, $area, $pic_name, $pic_department, $listData, $spv_name, $spv_department, $rangeDate, $templateType)
    {
        // dd($area);
        // 1. Ambil template sesuai templateType
        switch ($templateType) {
            case 1:
                $templatePath = storage_path('templates/Template_JAS_BAP.docx');
                break;
            case 2:
                $templatePath = storage_path('templates/Template_Kampar_BAP.docx');
                break;
            case 3:
                $templatePath = storage_path('templates/Template_Sangasanga_BAP.docx');
                break;
            case 4:
                $templatePath = storage_path('templates/Template_Sindang_BAP.docx');
                break;
            default:
                $templatePath = storage_path('templates/Template_Tambun_BAP.docx');
                break;
        }
        // switch ($area) {
        //     case 'Jati Asri':
        //         $templatePath = storage_path('templates/Template_JAS_BAP.docx');
        //     case 'Kampar':
        //         $templatePath = storage_path('templates/Template_Kampar_BAP.docx');
        //     case 'Sangasanga':
        //         $templatePath = storage_path('templates/Template_Sangasanga_BAP.docx');
        //     case 'Sindang':
        //         $templatePath = storage_path('templates/Template_Sindang_BAP.docx');
        //     default:
        //         // $templatePath = storage_path('templates/Template_Sindang_BAP.docx');
        //         $templatePath = storage_path('templates/Template_Tambun_BAP.docx');

        // }
        $template = new TemplateProcessor($templatePath);
        // dd($pic_name);
        // 2. Set variabel statis
        $template->setValue('AREA', strtoupper($area));
        $template->setValue('CLIENT', strtoupper($client));
        $template->setValue('PIC_NAME', strtoupper($pic_name));
        $template->setValue('PIC_DEPARTMENT', strtoupper($pic_department));
        $template->setValue('SPV_NAME', strtoupper($spv_name));
        $template->setValue('SPV_DEPARTMENT', strtoupper($spv_department));
        $template->setValue('CLIENT_NAME', strtoupper($client_name));
        $template->setValue('CLIENT_DEPARTMENT', strtoupper($client_department));
        $template->setValue('curr_date', str($rangeDate['startLabel']));
        $template->setValue('range_date', str($rangeDate['label']));

        // 3. Data list dinamis
        $list = $listData; // Gunakan data yang dilewatkan

        // 4. Clone row tabel
        if (count($list) > 0) {
            $template->cloneRow('no', count($list));
        } else {
            $template->cloneRow('no', 1);
            $template->setValue("unit_sn#1", '');
            $template->setValue("location#1", '');
            $template->setValue("avg_flowrate#1", '');
            $template->setValue("availability#1", '');
            $template->setValue("engine_sn#1", '');
        }
        foreach ($list as $index => $row) {
            $i = $index + 1;
            $template->setValue("no#$i", $i);
            $template->setValue("unit_sn#$i", $row['unit_sn']);
            $template->setValue("location#$i", $row['location']);
            $template->setValue("avg_flowrate#$i", $row['avg_flowrate']);
            $template->setValue("availability#$i", $row['availability']);
            $template->setValue("engine_sn#$i", $row['engine_sn']);
        }


        $safeUnitName = str_replace(' ', '_', $client);
        $filename = "{$safeUnitName}_BAPM_" . date('Ymd_His') . '.docx';

        $path = storage_path("app/temp/$filename");

        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        $template->saveAs($path);

        return $path;
    }

    // Generate dokumen BAPM (Berita Acara Pemeriksaan Mesin) per unit dari template docx
    public function exportBapm($unit, $location, $area, $events, $client, $name, $department, $client_name, $client_department)
    {
        // 1. Ambil template
        $templatePath = storage_path('templates/Template_BAPM.docx');
        $template = new TemplateProcessor($templatePath);

        // 2. Set variabel statis
        $template->setValue('unit_sn', $unit);
        $template->setValue('location', $location);
        $template->setValue('area', strtoupper($area));
        $template->setValue('client', strtoupper($client));
        $template->setValue('pic_name', strtoupper($name));
        $template->setValue('pic_department', strtoupper($department));
        $template->setValue('client_name', strtoupper($client_name));
        $template->setValue('client_department', strtoupper($client_department));

        // 3. Data list dinamis
        $list = $events;

        // 4. Clone row tabel
        if (count($list) > 0) {
            $template->cloneRow('no', count($list));
        } else {
            $template->cloneRow('no', 1);
            $template->setValue("no#1", '');
            $template->setValue("start#1", '');
            $template->setValue("end#1", '');
            $template->setValue("duration#1", '');
            $template->setValue("remarks#1", 'Tidak ada data');
        }


        foreach ($list as $index => $row) {
            $i = $index + 1;
            $template->setValue("no#$i", $i);
            $template->setValue("start#$i", $row['start_bapm']);
            $template->setValue("end#$i", $row['end_bapm']);
            $template->setValue("duration#$i", $row['duration']);
            $template->setValue("remarks#$i", $row['remarks']);
        }


        $safeUnitName = str_replace(' ', '_', $unit);
        $filename = "{$safeUnitName}_BAPM_" . date('Ymd_His') . '.docx';

        $path = storage_path("app/temp/$filename");

        // Pastikan direktori 'temp' ada
        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        $template->saveAs($path);

        return $path;
    }

    // Generate dokumen BA untuk request standby/shutdown (SD) per unit dari template docx
    public function exportBa_stdby_sd($request_type, $unit, $location, $events, $client, $name, $department, $client_name, $client_department)
    {
        // 1. Ambil template
        $templatePath = storage_path('templates/TEMPLATE_SD_STDBY.docx');
        $template = new TemplateProcessor($templatePath);

        // 2. Set variabel statis
        $template->setValue('request_type', $request_type);
        $template->setValue('unit', $unit);
        $template->setValue('location', $location);
        $template->setValue('client', strtoupper($client));
        $template->setValue('pic_name', strtoupper($name));
        $template->setValue('pic_department', strtoupper($department));
        $template->setValue('client_name', strtoupper($client_name));
        $template->setValue('client_department', strtoupper($client_department));

        // 3. Data list dinamis (Gunakan $events, bukan data dummy)
        $list = $events; // Gunakan data yang dilewatkan

        // 4. Clone row tabel
        if (count($list) > 0) {
            $template->cloneRow('no', count($list));
        } else {
            $template->cloneRow('no', 1);
            $template->setValue("no#1", '');
            $template->setValue("start_time#1", '');
            $template->setValue("end_time#1", '');
            $template->setValue("duration#1", '');
            $template->setValue("remarks#1", 'Tidak ada data');
        }


        foreach ($list as $index => $row) {
            $i = $index + 1;
            $template->setValue("no#$i", $i);
            $template->setValue("start_time#$i", $row['start']);
            $template->setValue("end_time#$i", $row['end']);
            $template->setValue("duration#$i", $row['duration']);
            $template->setValue("remarks#$i", $row['remarks']);
        }


        $safeUnitName = str_replace(' ', '_', $unit);
        $safeRequestType = str_replace(' ', '_', strtolower($request_type));
        $filename = "{$safeUnitName}_{$safeRequestType}_" . date('Ymd_His') . '.docx';

        $path = storage_path("app/temp/$filename");

        // Pastikan direktori 'temp' ada
        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        $template->saveAs($path);

        return $path;
    }
    // Endpoint utama: generate BA/BAPM/BAP untuk unit-unit terpilih lalu bungkus jadi satu file ZIP
    public function exportDoc(Request $request)
    {
        $validated = $request->validate([
            'unit_pos_id' => 'required|array',
            'ba_req' => 'required|boolean',
            'bapm' => 'required|boolean',
            'bap' => 'required|boolean',
            'month' => 'required_if:bap,true|integer|between:1,12',
        ]);
        // dd($validated['bapm']);
        $unitPosIds = $validated['unit_pos_id'];

        // ambil unit beserta relasi yang dibutuhkan untuk generate dokumen
        $units = UnitPosition::whereIn('id', $unitPosIds)->with(['requests', 'unit', 'location.area', 'client', 'baSettings', 'reports'])->get();

        $zipFileName = 'Laporan_' . date('Ymd_His') . '.zip';
        $zipPath = storage_path("app/public/$zipFileName");
        $allFiles = []; // kumpulan path file docx yang sudah dibuat, akan dizip

        if ($validated['bapm'] || $validated['ba_req']) {
            // generate BA (shutdown/standby) dan BAPM (PM) per unit
            foreach ($units as $unit) {
                $name = $unit->baSettings->pic_name ?? 'name';
                $area = $unit->location->area->area ?? '';
                $department = $unit->baSettings->pic_department ?? 'department';
                $client_name = $unit->baSettings->client_name ?? 'client name';
                $client_department = $unit->baSettings->client_department ?? 'client department';
                $unitName = $unit->unit->unit;
                $location = $unit->location->location;
                $requests = $unit->requests;
                $client = $unit->client->name;
                // transform tiap request jadi format tampilan (tanggal, durasi, dll)
                $transformed = $requests->map(function ($req) {
                    // Convert start & end date + time
                    $start = Carbon::parse($req->start_date . ' ' . $req->start_time);
                    if ($req->end_date && $req->end_time)
                        $end = Carbon::parse($req->end_date . ' ' . $req->end_time);
                    else
                        $end = null;
                    // Hitung durasi
                    $diff = $start->diff($end);
                    $duration = '';

                    $totalMinutes = $start->diffInMinutes($end);
                    $hours = floor($totalMinutes / 60);
                    $minutes = $totalMinutes % 60;

                    if ($hours > 0) {
                        $duration .= $hours . ' jam ';
                    }
                    if ($minutes > 0) {
                        $duration .= $minutes . ' menit';
                    }
                    $duration = trim($duration);


                    return [
                        'start_bapm' => $start->format('d F Y') . ', pkl. ' . $start->format('H:i'),
                        'end_bapm' => $end ? $end ? $end->format('d F Y') . ', pkl. ' . $end->format('H:i') : '' : '',
                        'start' => $start->format('d F Y') . ', ' . $start->format('H:i'),
                        'end' => $end ? $end->format('d F Y') . ', ' . $end->format('H:i') : '',
                        'remarks' => $req->remarks,
                        'duration' => $duration,
                        'request_type' => $req->request_type
                    ];
                });

                // Filter berdasarkan tipe request
                $shutdown = $transformed->filter(function ($req) {
                    return $req['request_type'] === 'sd';
                });

                $standby = $transformed->filter(function ($req) {
                    return $req['request_type'] === 'stdby';
                });

                // request dengan remarks diawali "PM" dianggap preventive maintenance
                $pm = $transformed->filter(function ($req) {
                    return isset($req['remarks'])
                        && Str::startsWith(strtoupper(trim($req['remarks'])), 'PM');
                });
                if ($validated['ba_req']) {
                    if ($shutdown->isNotEmpty()) {
                        $filePath = $this->exportBa_stdby_sd('SHUTDOWN', $unitName, $location, $shutdown->values(), $client, $name, $department, $client_name, $client_department);
                        $allFiles[] = ['path' => $filePath, 'unitName' => $unitName];
                    }

                    if ($standby->isNotEmpty()) {
                        $filePath = $this->exportBa_stdby_sd('STANDBY', $unitName, $location, $standby->values(), $client, $name, $department, $client_name, $client_department);
                        $allFiles[] = ['path' => $filePath, 'unitName' => $unitName];
                    }
                }

                if ($pm->isNotEmpty() && $validated['bapm']) {
                    $filePath = $this->exportBapm($unitName, $location, $area, $pm->values(), $client, $name, $department, $client_name, $client_department);
                    $allFiles[] = ['path' => $filePath, 'unitName' => $unitName];

                }
            }
        }

        if ($validated['bap']) {
            // BAP dikelompokkan per klien (bukan per unit)
            $clients = $units
                ->groupBy('client_id')
                ->map(function ($units) {
                    return [
                        'baSettings' => $units->first()->baSettings,
                        'client' => $units->first()->client,
                        'units' => $units->map(function ($unit) {
                            return [
                                'unit' => $unit,
                                'reports' => $unit->reports,
                            ];
                        })->values(),
                    ];
                });

            // BAP FILES
            foreach ($clients as $clientData) {
                $client = $clientData['client'];
                $units = $clientData['units'];
                $baSettings = $clientData['baSettings'];
                // Log::debug($baSettings->toJson(JSON_PRETTY_PRINT));
                $units = collect($units)->pluck('unit');


                $clientDataName = $client->name;
                $client_name = $baSettings?->client_name ? $baSettings->client_name : '';
                $client_department = $baSettings?->client_department ? $baSettings->client_department : '';
                $spv_name = $baSettings?->spv_name ? $baSettings->spv_name : '';
                $spv_department = $baSettings?->spv_department ? $baSettings->spv_department : '';
                $pic_name = $baSettings?->pic_name ? $baSettings->pic_name : '';
                $pic_department = $baSettings?->pic_department ? $baSettings->pic_department : '';
                $area = $units->pluck('location.area.area')->first();

                $month = (int) $validated['month'];
                $year = $validated['year'] ?? now()->year;
                // rentang tanggal = satu bulan penuh sesuai input
                $start = Carbon::create($year, $month, 1)->startOfMonth();
                $end = Carbon::create($year, $month, 1)->endOfMonth();
                $rangeDate = [
                    'startLabel' => $start->translatedFormat('j F Y'),
                    'start' => $start->toDateString(),
                    'end' => $end->toDateString(),
                    'label' => $start->translatedFormat('j') .
                        ' - ' .
                        $end->translatedFormat('j F Y'),
                ];

                // hitung availability & rata-rata flowrate tiap unit untuk isi tabel BAP
                $transformedUnits = $units->map(function ($item) use ($rangeDate) {
                    $reports = $item->reports
                        ->map(function ($report) {
                            $decoded = $report['data'];

                            if (is_string($decoded)) {
                                $decoded = json_decode($decoded, true);
                            }

                            return is_array($decoded) ? $decoded : null;
                        })
                        ->filter()
                        ->values();
                    $availability = $this->calculateAvailabilityByRange(
                        $item->requests,
                        $rangeDate
                    );
                    return [
                        'unit_sn' => $item->unit->unit_sn,
                        'engine_sn' => $item->unit->engine_sn || '',
                        'location' => $item->location->location ?? null,
                        'avg_flowrate' => round(
                            $this->getAvgByHourRange($reports, 'flowrate', $rangeDate),
                            2
                        ),
                        'availability' => $availability['average_availability'] . '%'
                    ];
                });

                $filePath = $this->exportBap(
                    $client_name,
                    $client_department,
                    $clientDataName,
                    $area,
                    $pic_name,
                    $pic_department,
                    $transformedUnits,
                    $spv_name,
                    $spv_department,
                    $rangeDate,
                    (int) ($client->template_ba ?? 1)
                );

                $allFiles[] = [
                    'path' => $filePath,
                    'unitName' => $client->name
                ];
            }
        }

        if (empty($allFiles)) {
            return response()->json([
                'message' => 'Tidak ada file yang dapat diekspor'
            ], 422);
        }
        // bungkus semua file docx yang dihasilkan ke dalam satu ZIP
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception("Tidak dapat membuat file ZIP");
        }

        foreach ($allFiles as $fileData) {
            $filePath = $fileData['path'];
            $folder = $fileData['unitName'];
            $fileName = basename($filePath);

            if (file_exists($filePath)) {
                $zip->addFile($filePath, $folder . '/' . $fileName);
            }
        }

        $zip->close();
        if (ob_get_level()) {
            ob_end_clean();
        }
        return response()->download($zipPath)->deleteFileAfterSend(true);

        // Hapus file Word temporary
        foreach ($allFiles as $filePath) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }
    // Konversi jam desimal (misal 1.5) menjadi format jam:menit (01:30)
    // Format jumlah jam (desimal) menjadi string "HH:MM"
    private function hoursToHMS($hours)
    {
        $h = floor($hours);
        $m = floor(($hours - $h) * 60);
        $s = round((($hours - $h) * 60 - $m) * 60);

        return sprintf('%02d:%02d', $h, $m);
    }
    // Generate invoice (xlsx) per klien untuk bulan tertentu, isi tabel unit + rekap harga dari template excel
    public function exportInvoice(Request $request)
    {
        $validated = $request->validate([
            'clients' => 'required|array',
            'clients.*' => 'exists:clients,client_id',
            'start_date' => 'date|nullable',
        ]);

        if (ob_get_length()) {
            ob_end_clean();
        }

        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])
            : Carbon::now()->startOfMonth();

        $year = $startDate->year;
        $month = $startDate->month;

        $endDate = $startDate->copy()->endOfMonth();

        $formattedStartDate = $startDate->format('d/m/Y');
        $unitPositions = UnitPosition::whereIn('client_id', $validated['clients'])
            ->with([
                'unit',
                'reports.request',
                'client',
                'reports' => function ($q) {
                    $q->orderBy('date', 'asc'); // TANPA filter
                }
            ])
            ->get();
        $groupedByClient = $unitPositions->groupBy('client_id');

        // klien dengan template_inv '3' dipakai untuk data CLU (diproses terpisah di bawah)
        $cluData = $groupedByClient->map(function ($clientUnits) {
            return $clientUnits
                ->filter(fn($item) => $item->client->is_invoice && $item->client->template_inv === '3')
                ->values();
        })->filter(fn($items) => $items->isNotEmpty());

        // klien non-CLU: filter report hanya untuk bulan/tahun yang diminta
        $groupedByClient = $groupedByClient->map(function ($clientUnits) use ($month, $year) {
            return $clientUnits
                ->filter(fn($item) => $item->client->is_invoice && $item->client->template_inv !== '3')
                ->map(function ($item) use ($month, $year) {
                    $item->reports = $item->reports
                        ->filter(
                            fn($r) =>
                            Carbon::parse($r->date)->year == $year &&
                            Carbon::parse($r->date)->month == $month
                        )
                        ->values();

                    return $item;
                })
                ->values();
        });

        if ($unitPositions->isEmpty()) {
            abort(404, 'Data not found');
        }

        $tempFolder = storage_path('app/temp');
        if (!file_exists($tempFolder)) {
            mkdir($tempFolder, 0777, true);
        }

        $generatedFiles = [];

        foreach ($groupedByClient as $clientId => $clientUnits) {
            if ($clientUnits->count() === 0) {
                continue;
            }
            // pilih template excel sesuai tipe invoice klien
            $templateInv = $clientUnits->first()->client->template_inv;
            $templatePath = $templateInv === '2'
                ? storage_path('templates/Template_inv_2.xlsx')
                : storage_path('templates/Template_inv.xlsx');
            $spreadsheet = IOFactory::load($templatePath);

            $baseSheet = $spreadsheet->getSheet(1); // sheet template per-unit, akan diduplikasi
            $templateSheet = clone $baseSheet;
            $sheet = null;
            $sheetIndex = 0;
            $lastRow = 0;
            $lastPriceRow = 0;
            $lastTotalPriceRow = 0;
            if (!empty($clientUnits)) {
                $rekapInvSheet = $spreadsheet->getSheet(0); // sheet rekap/ringkasan (sheet pertama)
                // dd($rekapInvSheet->getCell('A5'));
                // cari posisi cell placeholder ({{unit_sn}}, {{price_unit_sn}}, dst) di sheet rekap
                $placeholderRow = null;
                $placeholderCol = null;
                $pricePlaceholderRow = null;
                $pricePlaceholderCol = null;
                $totalPricePlaceholderRow = null;
                $totalPricePlaceholderCol = null;
                foreach ($rekapInvSheet->getRowIterator() as $row) {
                    foreach ($row->getCellIterator() as $cell) {

                        $coordinate = $cell->getCoordinate();
                        $isMerged = $rekapInvSheet->getMergeCells();
                        $value = trim((string) $cell->getValue());

                        foreach ($isMerged as $mergeRange) {
                            if ($cell->isInRange($mergeRange)) {
                                $topLeft = explode(':', $mergeRange)[0];
                                $value = trim((string) $rekapInvSheet->getCell($topLeft)->getValue());
                                $coordinate = $topLeft;
                                break;
                            }
                        }

                        if ($value === '{{unit_sn}}') {
                            [$placeholderCol, $placeholderRow] =
                                Coordinate::coordinateFromString($coordinate);

                            $lastRow = $placeholderRow;
                        }

                        if ($value === '{{start_date}}') {
                            $rekapInvSheet->setCellValue($coordinate, $formattedStartDate);
                        }
                        if ($value === '{{price_unit_sn}}') {
                            [$pricePlaceholderCol, $pricePlaceholderRow] =
                                Coordinate::coordinateFromString($coordinate);

                            $lastPriceRow = $pricePlaceholderRow;
                        }

                        if ($value === '{{total_price}}') {
                            [$totalPricePlaceholderCol, $totalPricePlaceholderRow] =
                                Coordinate::coordinateFromString($coordinate);

                            $lastTotalPriceRow = $totalPricePlaceholderRow;
                        }
                    }
                }
                if (!$placeholderRow) {
                    abort(300, 'Placeholder {{unit_sn}} not found!');
                }
                // loop tiap unit klien: tambah baris rekap + buat sheet detail sendiri per unit
                foreach ($clientUnits as $unitPos) {
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');

                    // insert row baru di sheet rekap untuk unit ini
                    $rekapInvSheet->insertNewRowBefore($lastRow + 1, 1);

                    $newRow = $lastRow + 1;
                    if ($totalPricePlaceholderRow >= $newRow) {
                        $totalPricePlaceholderRow++;
                    }
                    // copy style
                    $rekapInvSheet->duplicateStyle(
                        $rekapInvSheet->getStyle($placeholderCol . $placeholderRow),
                        $placeholderCol . $newRow
                    );

                    $rekapInvSheet->duplicateStyle(
                        $rekapInvSheet->getStyle($pricePlaceholderCol . $pricePlaceholderRow),
                        $pricePlaceholderCol . $newRow
                    );
                    // isi value
                    $rekapInvSheet->setCellValue(
                        $placeholderCol . $newRow,
                        "=\"Untuk 1 unit \"&'{$unitSn}'!\$D\$3"
                    );

                    $rekapInvSheet->setCellValue(
                        $pricePlaceholderCol . $newRow,
                        "='{$unitSn}'!S37"
                    );

                    // geser lastRow supaya next insert di bawahnya
                    $lastRow++;

                    // unit pertama pakai sheet template asli, unit berikutnya duplikat sheet baru
                    if ($sheetIndex == 0) {
                        $sheet = $baseSheet;
                    } else {
                        $tempSheet = clone $templateSheet;
                        $spreadsheet->addSheet($tempSheet);
                        $sheet = $spreadsheet->getSheet($spreadsheet->getSheetCount() - 1);
                    }
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');
                    $sheetName = substr($unitSn, 0, 31);
                    $sheetName = preg_replace('/[:\\/?*\[\]]/', '-', $sheetName);

                    $baseName = $unitSn;
                    $sheetName = $baseName;

                    $sheet->setTitle($sheetName);
                    $reports = $unitPos->reports->sortBy('date')->values();

                    // replace {{unit_sn}}
                    foreach ($sheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            if ($cell->getValue() === '{{unit_sn}}') {
                                $cell->setValue($unitSn);
                            }
                        }
                    }

                    // =====================
                    // WRITE DATA
                    // =====================
                    $startDate = Carbon::create($year, $month, 1);
                    $endDate = $startDate->copy()->endOfMonth();
                    $period = CarbonPeriod::create($startDate, $endDate);

                    $reportsGrouped = $reports->groupBy(function ($r) {
                        return Carbon::parse($r->date)->format('Y-m-d');
                    });

                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->unique('request_id')
                        ->values();

                    // hitung running/standby/down harian untuk unit ini selama sebulan
                    $availability = $this->calculateAvailabilityByRange($formattedRequests, ['start' => $startDate, 'end' => $endDate]);
                    $placeholders = [
                        '{{date}}',
                        '{{suction_press}}',
                        '{{discharge_press}}',
                        '{{flowrate}}',
                        '{{curve}}',
                        '{{run}}',
                        '{{stby}}',
                        '{{down}}',
                        '{{remarks}}'
                    ];

                    // cari kolom & baris awal tiap placeholder di sheet (letak tabel data harian)
                    $columns = [];
                    $startRow = 0;
                    $index = 0;
                    foreach ($spreadsheet->getAllSheets() as $nSheet) {
                        foreach ($nSheet->getRowIterator() as $row) {
                            foreach ($row->getCellIterator() as $cell) {

                                $value = $cell->getValue();

                                if (in_array($value, $placeholders)) {
                                    $columns[$value] = $cell->getColumn();

                                    if ($index == 0)
                                        $startRow = $cell->getRow();
                                    $index++;
                                }
                            }
                        }
                    }
                    // isi tabel baris per tanggal dalam periode
                    $currentRow = $startRow;
                    foreach ($period as $date) {
                        // dd($availability["daily"]);
                        $dateString = $date->format('Y-m-d');
                        // dd($availability["daily"][$dateString]['running']);
                        $run = $availability["daily"][$dateString]['running'] ?? 0;
                        $stdby = $availability["daily"][$dateString]['standby'] ?? 0;
                        $sd = $availability["daily"][$dateString]['down'] ?? 0;
                        $remarks = $availability["daily"][$dateString]['remarks'] ?? '';

                        // jika ada laporan di tanggal ini, hitung rata-rata dari laporan tsb; jika tidak, nilai 0
                        if (isset($reportsGrouped[$dateString])) {

                            $dayReports = $reportsGrouped[$dateString];

                            $suctionTotal = 0;
                            $dischargeTotal = 0;
                            $flowrateTotal = 0;

                            $formattedReports = $dayReports
                                ->map(function ($r) {

                                    $data = is_string($r->data)
                                        ? json_decode($r->data, true)
                                        : $r->data;
                                    if (!is_array($data)) {
                                        return null;
                                    }

                                    return [
                                        'date' => $r->date,
                                        'time' => $r->time,
                                        'suction_press' => $data['suction_press'] ?? 0,
                                        'discharge_press' => $data['discharge_press'] ?? 0,
                                        'flowrate' => $data['flowrate'] ?? 0,
                                        'curve' => $data['curve_24h'] ?? 0,
                                    ];
                                })
                                ->filter()
                                ->values();

                            $suctionTotal = $this->getAvgByHourRange($formattedReports, 'suction_press');
                            $dischargeTotal = $this->getAvgByHourRange($formattedReports, 'discharge_press');
                            $flowrateTotal = $this->getAvgByHourRange($formattedReports, 'flowrate');
                            $curveTotal = $this->getAvgByHourRange($formattedReports, 'curve');
                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => round($suctionTotal, 2),
                                'discharge_p' => round($dischargeTotal, 2),
                                'flowrate' => round($flowrateTotal, 2),
                                'curve' => round($curveTotal, 2),
                                'run' => $this->hoursToHMS($run),
                                'stby' => $this->hoursToHMS($stdby),
                                'down' => $this->hoursToHMS($sd),
                                'remarks' => $remarks,
                            ];

                        } else {
                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => 0,
                                'discharge_p' => 0,
                                'flowrate' => 0,
                                'curve' => 0,
                                'run' => $this->hoursToHMS($run),
                                'stby' => $this->hoursToHMS($stdby),
                                'down' => $this->hoursToHMS($sd),
                                'remarks' => $remarks,
                            ];
                        }
                        $volume = $report->flowrate * ($run / 24);
                        $curveValue = $report->curve * ($run / 24);
                        if (isset($columns['{{date}}']))
                            $sheet->setCellValue($columns['{{date}}'] . $currentRow, $report->date);
                        $sheet->setCellValue($columns['{{suction_press}}'] . $currentRow, $report->suction_p);
                        $sheet->setCellValue($columns['{{discharge_press}}'] . $currentRow, $report->discharge_p);
                        $sheet->setCellValue($columns['{{flowrate}}'] . $currentRow, $volume);
                        if (isset($columns['{{curve}}']))
                            $sheet->setCellValue($columns['{{curve}}'] . $currentRow, $curveValue);

                        $sheet->setCellValue($columns['{{run}}'] . $currentRow, $run / 24);
                        $sheet->setCellValue($columns['{{stby}}'] . $currentRow, $stdby / 24);
                        $sheet->setCellValue($columns['{{down}}'] . $currentRow, $sd / 24);

                        $sheet->getStyle(
                            $columns['{{run}}'] . $currentRow . ':' .
                            $columns['{{down}}'] . $currentRow
                        )->getNumberFormat()->setFormatCode('[h]:mm:ss');

                        $sheet->setCellValue($columns['{{remarks}}'] . $currentRow, $report->remarks);

                        $currentRow++;
                    }
                    $sheetIndex++;
                }
                // total harga = SUM formula dari semua baris harga unit yang ditambahkan
                $startRow = $pricePlaceholderRow + 1;
                $endRow = $lastRow;
                $rekapInvSheet->setCellValue(
                    $totalPricePlaceholderCol . $totalPricePlaceholderRow,
                    "=SUM({$pricePlaceholderCol}{$startRow}:{$pricePlaceholderCol}{$endRow})"
                );

                $rekapInvSheet->removeRow($placeholderRow); // hapus baris placeholder asli
            }
            // ======================
            // SAVE FILE PER CLIENT
            // ======================

            $writer = new Xlsx($spreadsheet);
            $writer->setPreCalculateFormulas(false);

            $fileName = "Invoice_{$unitPos->client->name}.xlsx";
            $filePath = $tempFolder . '/' . $fileName;
            $writer->save($filePath);

            $generatedFiles[] = $filePath;
        }

        // proses klien tipe CLU: laporan tahunan (bukan bulanan) pakai template terpisah
        foreach ($cluData as $clientId => $clientUnits) {
            // CLU YEARLY
            if ($clientUnits->count() === 0) {
                continue;
            }
            $templatePath = storage_path('templates/Template_CLU.xlsx');
            $spreadsheet = IOFactory::load($templatePath);
            $templatePathCLUInv = storage_path('templates/Template_CLU_invoice.xlsx');
            $spreadsheetCLUInv = IOFactory::load($templatePathCLUInv);

            $baseSheet = $spreadsheet->getSheet(1);
            $templateSheet = clone $baseSheet;
            $sheet = null;
            $sheetIndex = 0;
            if (!empty($clientUnits)) {
                foreach ($clientUnits as $unitPos) {
                    $locationName = $unitPos->location?->location ?? 'UNKNOWN';
                    $location = ">> {$locationName} <<";
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');

                    if ($sheetIndex == 0) {
                        $sheet = $baseSheet;
                    } else {
                        $tempSheet = clone $templateSheet;
                        $spreadsheet->addSheet($tempSheet);
                        $sheet = $spreadsheet->getSheet($spreadsheet->getSheetCount() - 1);
                    }
                    $sheetName = substr($unitSn, 0, 31);
                    $sheetName = preg_replace('/[:\\/?*\[\]]/', '-', $sheetName);

                    $baseName = $unitSn;
                    $sheetName = $baseName;

                    $sheet->setTitle($sheetName);
                    $reports = $unitPos->reports->sortBy('date')->values();

                    $reportsByDate = $reports->keyBy(function ($item) {
                        return Carbon::parse($item->date)->toDateString();
                    });


                    // rentang 1 tahun penuh untuk laporan CLU
                    $start = Carbon::create($year, 1, 1);
                    $end = $start->copy()->endOfYear();
                    foreach ($sheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            if ($cell->getValue() === '{{start_date}}') {
                                $cell->setValue($start->format('d-M-y'));
                            }
                            if ($cell->getValue() === '{{location}}') {
                                $cell->setValue($location);
                            }
                        }
                    }
                    // isi tiap tanggal dalam setahun dengan report yg ada, atau data kosong jika tidak ada
                    $finalReports = collect();

                    while ($start <= $end) {
                        $dateKey = $start->toDateString();

                        if ($reportsByDate->has($dateKey)) {
                            $finalReports->push($reportsByDate[$dateKey]);
                        } else {
                            $finalReports->push((object) [
                                'date' => $dateKey,
                                'data' => null,
                            ]);
                        }

                        $start->addDay();
                    }

                    // =====================
                    // WRITE DATA
                    // =====================
                    $startDate = Carbon::create($year, 1, 1);
                    $endDate = Carbon::create($year, 12, 1)->endOfMonth();
                    $period = CarbonPeriod::create($startDate, $endDate);

                    $reportsGrouped = $finalReports->groupBy(function ($r) {
                        return Carbon::parse($r->date)->format('Y-m-d');
                    });

                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->unique('request_id')
                        ->values();

                    $availability = $this->calculateAvailabilityByRange($formattedRequests, ['start' => $startDate, 'end' => $endDate]);
                    $placeholders = [
                        '{{date}}',
                        '{{suction_press}}',
                        '{{discharge_press}}',
                        '{{flowrate}}',
                        '{{bef_cooler}}',
                        '{{aft_cooler}}',
                        '{{run}}',
                        '{{stby}}',
                        '{{down}}',
                        '{{remarks}}',
                        '{{availability}}'
                    ];
                    // cari kolom & baris awal tiap placeholder di sheet (letak tabel data harian)
                    $columns = [];
                    $startRow = 0;
                    $index = 0;
                    foreach ($spreadsheet->getAllSheets() as $nSheet) {
                        foreach ($nSheet->getRowIterator() as $row) {
                            foreach ($row->getCellIterator() as $cell) {

                                $value = $cell->getValue();

                                if (in_array($value, $placeholders)) {
                                    $columns[$value] = $cell->getColumn();
                                    if ($index == 0)
                                        $startRow = $cell->getRow();
                                    $index++;
                                }
                            }
                        }
                    }
                    $currentRow = $startRow;
                    $prevMonth = null;

                    foreach ($period as $date) {

                        $currentMonth = $date->month;

                        // sisipkan baris kosong tiap pergantian bulan (template CLU punya pemisah antar bulan)
                        if ($prevMonth !== null && $prevMonth !== $currentMonth) {

                            // default: skip 1 row
                            $currentRow++;

                            if ($prevMonth == 2 && $currentMonth == 3) {
                                $currentRow++; // extra skip (Februari punya baris tambahan di template)
                            }
                        }

                        $prevMonth = $currentMonth;

                        $dateString = $date->format('Y-m-d');
                        $run = $availability["daily"][$dateString]['running'] ?? 0;
                        $stdby = $availability["daily"][$dateString]['standby'] ?? 0;
                        $sd = $availability["daily"][$dateString]['down'] ?? 0;
                        $availabilityDay = $availability["daily"][$dateString]['availability'] ?? 0;
                        $remarks = $availability["daily"][$dateString]['remarks'] ?? '';

                        // jika ada laporan di tanggal ini, hitung rata-rata dari laporan tsb; jika tidak, nilai 0
                        if (isset($reportsGrouped[$dateString])) {

                            $dayReports = $reportsGrouped[$dateString];

                            $formattedReports = $dayReports
                                ->map(function ($r) {
                                    $data = is_string($r->data)
                                        ? json_decode($r->data, true)
                                        : $r->data;

                                    if (!is_array($data))
                                        return null;

                                    return [
                                        'date' => $r->date,
                                        'time' => $r->time,
                                        'suction_press' => $data['suction_press'] ?? 0,
                                        'discharge_press' => $data['discharge_press'] ?? 0,
                                        'bef_cooler' => $data['bef_cooler'] ?? 0,
                                        'aft_cooler' => $data['aft_cooler'] ?? 0,
                                        'flowrate' => $data['flowrate'] ?? 0,
                                    ];
                                })
                                ->filter()
                                ->values();

                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => round($this->getAvgByHourRange($formattedReports, 'suction_press'), 2),
                                'discharge_p' => round($this->getAvgByHourRange($formattedReports, 'discharge_press'), 2),
                                'flowrate' => round($this->getAvgByHourRange($formattedReports, 'flowrate'), 2),
                                'bef_cooler' => round($this->getAvgByHourRange($formattedReports, 'bef_cooler'), 2),
                                'aft_cooler' => round($this->getAvgByHourRange($formattedReports, 'aft_cooler'), 2),
                                'run' => $run,
                                'stby' => $stdby,
                                'down' => $sd,
                                'remarks' => $remarks,
                            ];

                        } else {
                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => 0,
                                'discharge_p' => 0,
                                'flowrate' => 0,
                                'bef_cooler' => 0,
                                'aft_cooler' => 0,
                                'run' => $run,
                                'stby' => $stdby,
                                'down' => $sd,
                                'remarks' => $remarks,
                            ];
                        }

                        $volume = $report->flowrate * ($run / 24);

                        $sheet->setCellValue($columns['{{date}}'] . $currentRow, $report->date);
                        $sheet->setCellValue($columns['{{suction_press}}'] . $currentRow, $report->suction_p);
                        $sheet->setCellValue($columns['{{discharge_press}}'] . $currentRow, $report->discharge_p);
                        $sheet->setCellValue($columns['{{bef_cooler}}'] . $currentRow, $report->bef_cooler);
                        $sheet->setCellValue($columns['{{aft_cooler}}'] . $currentRow, $report->aft_cooler);
                        $sheet->setCellValue($columns['{{flowrate}}'] . $currentRow, $volume);

                        $sheet->setCellValue($columns['{{run}}'] . $currentRow, $run / 24);
                        $sheet->setCellValue($columns['{{stby}}'] . $currentRow, $stdby / 24);
                        $sheet->setCellValue($columns['{{down}}'] . $currentRow, $sd / 24);
                        $sheet->setCellValue($columns['{{availability}}'] . $currentRow, $availabilityDay / 100);
                        $sheet->setCellValue($columns['{{remarks}}'] . $currentRow, $report->remarks);

                        $currentRow++;
                    }
                    $sheetIndex++;
                }
            }

            // CLU INV PER UNIT - buat file invoice terpisah khusus klien CLU (bulanan, beda dari laporan tahunan di atas)
            $baseSheetCLUInv = $spreadsheetCLUInv->getSheet(1);
            $templateSheetCLUInv = clone $baseSheetCLUInv;
            $sheetCLUInv = null;
            $sheetIndexCLUInv = 0;

            if (!empty($clientUnits)) {
                $rekapInvSheet = $spreadsheetCLUInv->getSheet(0);
                $placeholders = [
                    '{{locations}}',
                    '{{unit_sn}}',
                    '{{price_unit_sn}}',
                    '{{total_price}}',
                ];
                $coordinates = [];

                $coordinates = [];

                foreach ($rekapInvSheet->getRowIterator() as $row) {
                    foreach ($row->getCellIterator() as $cell) {

                        $cellCoordinate = $cell->getCoordinate();
                        $value = trim((string) $cell->getValue());

                        if ($value === '{{start_date}}') {
                            $rekapInvSheet->setCellValue(
                                $cellCoordinate,
                                Carbon::create($year, $month, 1)->format('d-M-Y')
                            );
                            continue;
                        }

                        if (in_array($value, $placeholders)) {
                            [$col, $rowNum] = Coordinate::coordinateFromString($cellCoordinate);

                            $coordinates[$value] = [
                                'column' => $col,
                                'row' => $rowNum
                            ];
                        }
                    }
                }

                // loop tiap unit: tambah baris rekap invoice + buat sheet detail perhitungan per unit
                foreach ($clientUnits as $unitPos) {
                    $templateRow = $coordinates['{{unit_sn}}']['row'] + $sheetIndexCLUInv;

                    $locationName = $unitPos->location?->location ?? 'UNKNOWN';
                    $words = explode(' ', $locationName);
                    $selected = array_slice($words, 1, 3);
                    $result = implode(' ', $selected);

                    $location = "$result";
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');
                    $sheetName = substr($unitSn, 0, 31);
                    // $sheetName = preg_replace('/[:\\/?*\[\]]/', '-', $sheetName);
                    preg_match('/\d+/', $unitSn, $matches);

                    $number = $matches[0] ?? 'UNKNOWN';
                    $sheetName = "$location-$number";
                    $sheetName = $unitSn;

                    $rekapInvSheet->insertNewRowBefore($templateRow, 1);

                    $rekapInvSheet->setCellValue($coordinates['{{unit_sn}}']['column'] . $templateRow, $unitSn);
                    $rekapInvSheet->setCellValue($coordinates['{{locations}}']['column'] . $templateRow, $locationName);
                    $formula = "=IF('{$sheetName}'!L42=\"\",\"\",'{$sheetName}'!L42)";

                    $rekapInvSheet->setCellValue(
                        $coordinates['{{price_unit_sn}}']['column'] . $templateRow,
                        $formula
                    );
                    if ($sheetIndexCLUInv == 0) {
                        $sheetCLUInv = $baseSheetCLUInv;
                        $sheetCLUInv->setTitle($sheetName);
                    } else {
                        $tempSheetCLUInv = clone $templateSheetCLUInv;
                        $tempSheetCLUInv->setTitle($sheetName);
                        $spreadsheetCLUInv->addSheet($tempSheetCLUInv);
                        $sheetCLUInv = $spreadsheetCLUInv->getSheet($spreadsheetCLUInv->getSheetCount() - 1);
                    }


                    $reports = $unitPos->reports->sortBy('date')->values();

                    $reportsByDate = $reports->keyBy(function ($item) {
                        return Carbon::parse($item->date)->toDateString();
                    });


                    $start = Carbon::create($year, $month, 1)->startOfMonth();
                    $endCLU = Carbon::create($year, $month, 1)->endOfMonth();

                    // isi tiap tanggal dalam setahun dengan report yg ada, atau data kosong jika tidak ada
                    $finalReports = collect();

                    while ($start <= $end) {
                        $dateKey = $start->toDateString();

                        if ($reportsByDate->has($dateKey)) {
                            $finalReports->push($reportsByDate[$dateKey]);
                        } else {
                            $finalReports->push((object) [
                                'date' => $dateKey,
                                'data' => null,
                            ]);
                        }

                        $start->addDay();
                    }

                    // =====================
                    // WRITE DATA
                    // =====================
                    $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                    $endDate = $endCLU;
                    $period = CarbonPeriod::create($startDate, $endDate);

                    $reportsGrouped = $finalReports->groupBy(function ($r) {
                        return Carbon::parse($r->date)->format('Y-m-d');
                    });

                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->unique('request_id')
                        ->values();

                    $availability = $this->calculateAvailabilityByRange($formattedRequests, ['start' => $startDate, 'end' => $endDate]);
                    $placeholders = [
                        '{{date}}',
                        '{{suction_press}}',
                        '{{discharge_press}}',
                        '{{flowrate}}',
                        '{{run}}',
                        '{{stby}}',
                        '{{down}}',
                        '{{remarks}}',
                        '{{avg_suction_press}}',
                        '{{avg_suction_press}}',
                        '{{avg_discharge_press}}',
                        '{{avg_flowrate}}',
                        '{{avg_run}}',
                        '{{total_flowrate}}',
                        '{{total_run}}',
                        '{{total_stby}}',
                        '{{total_down}}',

                    ];
                    $columns = [];
                    $rows = [];
                    $startRow = 0;
                    $index = 0;
                    foreach ($spreadsheetCLUInv->getAllSheets() as $nSheet) {
                        foreach ($nSheet->getRowIterator() as $row) {
                            foreach ($row->getCellIterator() as $cell) {

                                $value = $cell->getValue();

                                if (in_array($value, $placeholders)) {
                                    $columns[$value] = $cell->getColumn();
                                    $rows[$value] = $cell->getRow();
                                    if ($index == 0)
                                        $startRow = $cell->getRow();
                                    $index++;
                                }
                            }
                        }
                    }
                    $currentRow = $startRow;
                    $prevMonth = null;

                    foreach ($period as $date) {

                        $currentMonth = $date->month;

                        // sisipkan baris kosong tiap pergantian bulan (template CLU punya pemisah antar bulan)
                        if ($prevMonth !== null && $prevMonth !== $currentMonth) {

                            // default: skip 1 row
                            $currentRow++;

                            if ($prevMonth == 2 && $currentMonth == 3) {
                                $currentRow++; // extra skip (Februari punya baris tambahan di template)
                            }
                        }

                        $prevMonth = $currentMonth;

                        $dateString = $date->format('Y-m-d');
                        $run = $availability["daily"][$dateString]['running'] ?? 0;
                        $stdby = $availability["daily"][$dateString]['standby'] ?? 0;
                        $sd = $availability["daily"][$dateString]['down'] ?? 0;
                        $remarks = $availability["daily"][$dateString]['remarks'] ?? '';

                        // jika ada laporan di tanggal ini, hitung rata-rata dari laporan tsb; jika tidak, nilai 0
                        if (isset($reportsGrouped[$dateString])) {

                            $dayReports = $reportsGrouped[$dateString];

                            $formattedReports = $dayReports
                                ->map(function ($r) {
                                    $data = is_string($r->data)
                                        ? json_decode($r->data, true)
                                        : $r->data;

                                    if (!is_array($data))
                                        return null;

                                    return [
                                        'date' => $r->date,
                                        'time' => $r->time,
                                        'suction_press' => $data['suction_press'] ?? 0,
                                        'discharge_press' => $data['discharge_press'] ?? 0,
                                        'flowrate' => $data['flowrate'] ?? 0,
                                    ];
                                })
                                ->filter()
                                ->values();

                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => round($this->getAvgByHourRange($formattedReports, 'suction_press'), 2),
                                'discharge_p' => round($this->getAvgByHourRange($formattedReports, 'discharge_press'), 2),
                                'flowrate' => round($this->getAvgByHourRange($formattedReports, 'flowrate'), 2),
                                'run' => $run,
                                'stby' => $stdby,
                                'down' => $sd,
                                'remarks' => $remarks,
                            ];

                        } else {
                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => 0,
                                'discharge_p' => 0,
                                'flowrate' => 0,
                                'run' => $run,
                                'stby' => $stdby,
                                'down' => $sd,
                                'remarks' => $remarks,
                            ];
                        }

                        $volume = $report->flowrate * ($run / 24);

                        $sheetCLUInv->setCellValue($columns['{{date}}'] . $currentRow, $report->date);
                        $sheetCLUInv->setCellValue($columns['{{suction_press}}'] . $currentRow, $report->suction_p);
                        $sheetCLUInv->setCellValue($columns['{{discharge_press}}'] . $currentRow, $report->discharge_p);
                        $sheetCLUInv->setCellValue($columns['{{flowrate}}'] . $currentRow, $volume);

                        $sheetCLUInv->setCellValue($columns['{{run}}'] . $currentRow, $run);
                        $sheetCLUInv->setCellValue($columns['{{stby}}'] . $currentRow, $stdby);
                        $sheetCLUInv->setCellValue($columns['{{down}}'] . $currentRow, $sd);
                        $sheetCLUInv->setCellValue($columns['{{remarks}}'] . $currentRow, $report->remarks);

                        $currentRow++;
                    }
                    $sheetIndexCLUInv++;
                    $cols = [
                        '{{suction_press}}' => ['{{avg_suction_press}}'],
                        '{{discharge_press}}' => ['{{avg_discharge_press}}'],
                        '{{flowrate}}' => ['{{avg_flowrate}}', '{{total_flowrate}}'],
                        '{{run}}' => ['{{avg_run}}', '{{total_run}}'],
                        '{{stby}}' => ['{{total_stby}}'],
                        '{{down}}' => ['{{total_down}}'],
                    ];
                    foreach ($cols as $sourceKey => $targets) {

                        if (!isset($columns[$sourceKey]))
                            continue;

                        $col = $columns[$sourceKey];

                        foreach ($targets as $targetKey) {

                            if (!isset($columns[$targetKey], $rows[$targetKey]))
                                continue;

                            if (str_contains($targetKey, 'avg')) {
                                $formula = "=AVERAGE({$col}{$startRow}:{$col}{$currentRow})";
                            } else {
                                $formula = "=SUM({$col}{$startRow}:{$col}{$currentRow})";
                            }

                            $sheetCLUInv->setCellValue(
                                $columns[$targetKey] . $rows[$targetKey],
                                $formula
                            );
                        }
                    }
                }
                $rowToDelete = $coordinates['{{unit_sn}}']['row'] + $sheetIndexCLUInv;
                $col = $coordinates['{{price_unit_sn}}']['column'];
                $start = $coordinates['{{unit_sn}}']['row'];
                $end = $rowToDelete - 1;

                $formula = "=SUM({$col}{$start}:{$col}{$end})";
                $rekapInvSheet->setCellValue(
                    $coordinates['{{total_price}}']['column'] . $coordinates['{{total_price}}']['row'] + $sheetIndexCLUInv,
                    $formula
                );
                
                $rekapInvSheet->removeRow($rowToDelete, 1);

            }

            // ======================
            // SAVE FILE PER CLIENT
            // ======================
            $filePathCLU = $tempFolder . '/' . $unitPos->client->name . '_yearly.xlsx';
            $writerCLU = new Xlsx($spreadsheet);
            $writerCLU->setPreCalculateFormulas(false);
            $writerCLU->save($filePathCLU);

            $filePathINV = $tempFolder . '/' . $unitPos->client->name . '_INV.xlsx';
            $writerINV = new Xlsx($spreadsheetCLUInv);
            $writerINV->setPreCalculateFormulas(false);
            $writerINV->save($filePathINV);

            $generatedFiles[] = $filePathCLU;
            $generatedFiles[] = $filePathINV;
        }


        // =====================
        // SINGLE FILE
        // =====================
        if (count($generatedFiles) === 1) {
            return response()->download(
                $generatedFiles[0],
                basename($generatedFiles[0]),
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]
            )->deleteFileAfterSend(true);
        }

        // =====================
        // MULTIPLE → ZIP
        // =====================

        $zipPath = $tempFolder . '/Invoices.zip';

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {

            foreach ($generatedFiles as $file) {
                $zip->addFile($file, basename($file));
            }

            $zip->close();
        }

        return response()->download(
            $zipPath,
            'Invoices.zip',
            ['Content-Type' => 'application/zip']
        )->deleteFileAfterSend(true);
    }

    // Generate laporan denda/penalty (xlsx) per klien berdasarkan data suction/flowrate bulanan
    public function exportPenalty(Request $request)
    {
        $validated = $request->validate([
            'clients' => 'required|array',
            'clients.*' => 'exists:clients,client_id',
            'start_date' => 'date|nullable'
        ]);

        if (ob_get_length()) {
            ob_end_clean();
        }

        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])
            : Carbon::now()->startOfMonth();

        $year = $startDate->year;
        $month = $startDate->month;

        $endDate = $startDate->copy()->endOfMonth();

        $formattedStartDate = $startDate->format('d/m/Y');
        $unitPositions = UnitPosition::whereIn('client_id', $validated['clients'])
            ->with([
                'unit',
                'reports.request',
                'client',
                'reports' => function ($q) use ($month, $year) {
                    $q->whereYear('date', $year)
                        ->whereMonth('date', $month)
                        ->orderBy('date', 'asc');
                }
            ])
            ->get();
        $groupedByClient = $unitPositions->groupBy('client_id');

        if ($unitPositions->isEmpty()) {
            abort(404, 'Data not found');
        }

        $tempFolder = storage_path('app/temp');
        if (!file_exists($tempFolder)) {
            mkdir($tempFolder, 0777, true);
        }

        $generatedFiles = [];
        $firstColRow = [];
        foreach ($groupedByClient as $clientId => $clientUnits) {

            $templatePath = storage_path('templates/Template_Denda.xlsx');
            $spreadsheet = IOFactory::load($templatePath);

            $sheet = $spreadsheet->getActiveSheet();
            if (!empty($clientUnits)) {
                $unitIndex = 0;
                $header1 = "SUCTION HEADER";
                $header2 = "FLOWRATE";
                $header3 = "PERFORMANCE PENALTY";
                $rowIndex = 0;
                $h3HeaderCol = null;
                $h3HeaderRow = null;
                $h3LastDataCol = null;
                $h3ColIdx = null;
                $h3DataColIdx = null;
                $h3RowNum = null;
                $h3DataRowNum = null;
                $h3UnitSnRow = null;
                // INSERT DATA
                foreach ($clientUnits as $unitPos) {
                    $dayIndex = 0;
                    $reports = $unitPos->reports->sortBy('date')->values();
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');
                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->unique('request_id')
                        ->values();

                    $sheetName = substr($unitSn, 0, 31);
                    $sheetName = preg_replace('/[:\\/?*\[\]]/', '-', $sheetName);

                    $baseName = $unitSn;
                    $sheetName = $baseName;

                    // =====================
                    // WRITE DATA
                    // =====================
                    $startDate = Carbon::create($year, $month, 1);
                    $endDate = $startDate->copy()->endOfMonth();
                    $period = CarbonPeriod::create($startDate, $endDate);

                    $reportsGrouped = $reports->groupBy(function ($r) {
                        return Carbon::parse($r->date)->format('Y-m-d');
                    });

                    $placeholders = [
                        '{{header1}}',
                        '{{header2}}',
                        '{{header3}}',
                        '{{header1_data}}',
                        '{{header2_data}}',
                        '{{header3_data}}',
                        '{{unit_sn}}',
                        '{{date}}',
                    ];

                    $columns = [];
                    $unitSnPositions = [];
                    $insertCol = 0;
                    foreach ($spreadsheet->getAllSheets() as $nSheet) {
                        foreach ($nSheet->getRowIterator() as $row) {
                            foreach ($row->getCellIterator() as $cell) {

                                $value = $cell->getValue();

                                if (!in_array($value, $placeholders)) {
                                    continue;
                                }

                                if ($value === '{{unit_sn}}') {

                                    $unitSnPositions[] = [
                                        'column' => $cell->getColumn(),
                                        'row' => $cell->getRow(),
                                    ];

                                } else {

                                    $columns[$value] = [
                                        'column' => $cell->getColumn(),
                                        'row' => $cell->getRow(),
                                    ];

                                    if ($unitIndex == 0) {
                                        $firstColRow[$value] = [
                                            'column' => $cell->getColumn(),
                                            'row' => $cell->getRow(),
                                        ];
                                    }
                                }
                            }
                        }
                    }

                    if ($clientUnits->count() > 1 && $clientUnits->count() != $unitIndex) {
                        $startCol = Coordinate::columnIndexFromString($columns['{{header1}}']['column']);
                        // Determine H3 boundary to exclude its {{unit_sn}} from the H1/H2 block width.
                        $h3BoundaryColIdx = $h3ColIdx ?? Coordinate::columnIndexFromString($columns['{{header3}}']['column']);
                        $h1h2Sns = array_values(array_filter($unitSnPositions, fn($p) =>
                            Coordinate::columnIndexFromString($p['column']) < $h3BoundaryColIdx
                        ));
                        $lastUnitSn = !empty($h1h2Sns) ? end($h1h2Sns) : null;

                        $endCol = $lastUnitSn
                            ? Coordinate::columnIndexFromString($lastUnitSn['column'])
                            : ($startCol + 1);
                        $blockWidth = $endCol - $startCol + 1;
                        $newBlockStart = $endCol + 1;
                        $insertCol = $endCol;
                        $startRow = $columns['{{header1}}']['row'];
                        $highestRow = $sheet->getHighestRow();
                        $sheet->insertNewColumnBefore(
                            Coordinate::stringFromColumnIndex($newBlockStart),
                            $blockWidth
                        );

                        for ($i = 0; $i < $blockWidth; $i++) {

                            $srcCol = Coordinate::stringFromColumnIndex($startCol + $i);
                            $dstCol = Coordinate::stringFromColumnIndex($newBlockStart + $i);

                            for ($r = $startRow; $r <= $highestRow; $r++) {

                                $srcCell = $srcCol . $r;
                                $dstCell = $dstCol . $r;

                                // copy value
                                $sheet->setCellValue(
                                    $dstCell,
                                    $sheet->getCell($srcCell)->getValue()
                                );

                                // copy style
                                $sheet->duplicateStyle(
                                    $sheet->getStyle($srcCell),
                                    $dstCell
                                );

                                // copy conditional formatting
                                $conditionalStyles = $sheet->getConditionalStyles($srcCell);
                                if (!empty($conditionalStyles)) {
                                    $sheet->setConditionalStyles($dstCell, $conditionalStyles);
                                }
                            }
                        }

                        // On the first unit, seed H3 tracking from the scan result.
                        if ($h3ColIdx === null) {
                            $h3ColIdx     = Coordinate::columnIndexFromString($columns['{{header3}}']['column']);
                            $h3RowNum     = $columns['{{header3}}']['row'];
                            $h3DataColIdx = Coordinate::columnIndexFromString($columns['{{header3_data}}']['column']);
                            $h3DataRowNum = $columns['{{header3_data}}']['row'];
                            // Find the {{unit_sn}} row in the H3 section (column >= H3 header column).
                            foreach ($unitSnPositions as $pos) {
                                if (Coordinate::columnIndexFromString($pos['column']) >= $h3ColIdx) {
                                    $h3UnitSnRow = $pos['row'];
                                    break;
                                }
                            }
                        }

                        // H3 is to the right of the H1/H2 block — shift it by $blockWidth.
                        $h3ColIdx     += $blockWidth;
                        $h3DataColIdx += $blockWidth;

                        // Expand only the H3 data column for the next unit (header stays as one spanning cell).
                        $h3DataColStr    = Coordinate::stringFromColumnIndex($h3DataColIdx);
                        $h3NewDataColStr = Coordinate::stringFromColumnIndex($h3DataColIdx + 1);
                        $highestRowH3    = $sheet->getHighestRow();

                        $sheet->insertNewColumnBefore($h3NewDataColStr, 1);

                        for ($r = $h3DataRowNum; $r <= $highestRowH3; $r++) {
                            $sheet->setCellValue($h3NewDataColStr . $r, $sheet->getCell($h3DataColStr . $r)->getValue());
                            $sheet->duplicateStyle($sheet->getStyle($h3DataColStr . $r), $h3NewDataColStr . $r);
                            $cs = $sheet->getConditionalStyles($h3DataColStr . $r);
                            if (!empty($cs)) {
                                $sheet->setConditionalStyles($h3NewDataColStr . $r, $cs);
                            }
                        }

                        // Keep $columns in sync so the data-write loop below uses the right H3_data column.
                        $columns['{{header3_data}}']['column'] = $h3DataColStr;

                        // Write unit_sn directly to the H3 data column (stale scan position can't be used
                        // because insertions shifted H3 cells to the right).
                        if ($h3UnitSnRow !== null) {
                            $sheet->setCellValue($h3DataColStr . $h3UnitSnRow, $unitSn);
                        }

                        $header1StartRow = $columns['{{header1}}']['row'];
                        $header2StartRow = $columns['{{header2}}']['row'];

                        $sheet->setCellValue($columns['{{header1}}']['column'] . $header1StartRow, $header1);
                        $sheet->setCellValue($columns['{{header2}}']['column'] . $header2StartRow, $header2);
                        // H3 header is written only on the first unit; it spans all units' penalty columns.
                        if ($unitIndex === 0) {
                            $h3HeaderCol = Coordinate::stringFromColumnIndex($h3ColIdx);
                            $h3HeaderRow = $h3RowNum;
                            $sheet->setCellValue($h3HeaderCol . $h3HeaderRow, $header3);
                        }
                        // Only write unit_sn to H1/H2 positions; H3 is handled directly via $h3DataColStr.
                        foreach ($unitSnPositions as $pos) {
                            if (Coordinate::columnIndexFromString($pos['column']) < $h3BoundaryColIdx) {
                                $sheet->setCellValue(
                                    $pos['column'] . $pos['row'],
                                    $unitSn
                                );
                            }
                        }
                        foreach ($period as $date) {

                            $dateString = $date->format('Y-m-d');
                            $formattedDate = $date->format('d-M-Y');
                            if (isset($reportsGrouped[$dateString])) {

                                $dayReports = $reportsGrouped[$dateString];

                                $formattedReports = $dayReports
                                    ->map(function ($r) {

                                        $data = is_string($r->data)
                                            ? json_decode($r->data, true)
                                            : $r->data;

                                        if (!is_array($data)) {
                                            return null;
                                        }

                                        return [
                                            'date' => $r->date,
                                            'time' => $r->time,
                                            'suction_press' => $data['suction_press'] ?? 0,
                                            'discharge_press' => $data['discharge_press'] ?? 0,
                                            'flowrate' => $data['flowrate'] ?? 0,
                                        ];
                                    })
                                    ->filter()
                                    ->values();

                                $suctionTotal = $this->getAvgByHourRange($formattedReports, 'suction_press');
                                $flowrateTotal = $this->getAvgByHourRange($formattedReports, 'flowrate');

                                $report = (object) [
                                    'date' => $formattedDate,
                                    'suction_p' => round($suctionTotal, 2),
                                    'flowrate' => round($flowrateTotal, 2),
                                ];

                            } else {

                                $report = (object) [
                                    'date' => $formattedDate,
                                    'suction_p' => 0,
                                    'flowrate' => 0,
                                ];
                            }
                            if ($unitIndex === 0) {
                                $rowDate = $columns['{{date}}']['row'] + $dayIndex;
                                $colDate = $columns['{{date}}']['column'];
                                $sheet->setCellValue(
                                    $colDate . $rowDate,
                                    $report->date
                                );
                            }
                            // suction row
                            $rowSuction = $columns['{{header1_data}}']['row'] + $dayIndex;
                            $colSuction = $columns['{{header1_data}}']['column'];

                            $sheet->setCellValue(
                                $colSuction . $rowSuction,
                                $report->suction_p
                            );

                            // flowrate row
                            $rowFlowrate = $columns['{{header2_data}}']['row'] + $dayIndex;
                            $colFlowRate = $columns['{{header2_data}}']['column'];

                            $sheet->setCellValue(
                                $colFlowRate . $rowFlowrate,
                                $report->flowrate
                            );

                            // flowrate row
                            $performance_penalty = $columns['{{header3_data}}']['row'] + $dayIndex;
                            $suction = $colSuction . $rowSuction;
                            $flow = $colFlowRate . $rowFlowrate;

                            $formula = "=IF(AND($suction>=10,$flow<0.2),ROUND((0.2-$flow)*\$C\$2,0),0)";

                            $sheet->setCellValue(
                                $columns['{{header3_data}}']['column'] . $performance_penalty,
                                $formula
                            );
                            $dayIndex++;
                        }
                        // Record this unit's H3 data column, then advance the index to the copy
                        // so the next unit's += blockWidth lands on the correct (shifted) copy.
                        $h3LastDataCol = $h3DataColStr;
                        $h3DataColIdx += 1;
                    } else {
                        foreach ($period as $date) {

                            $dateString = $date->format('Y-m-d');
                            $formattedDate = $date->format('d-M-Y');

                            if (isset($reportsGrouped[$dateString])) {

                                $dayReports = $reportsGrouped[$dateString];

                                $formattedReports = $dayReports
                                    ->map(function ($r) {

                                        $data = is_string($r->data)
                                            ? json_decode($r->data, true)
                                            : $r->data;

                                        if (!is_array($data)) {
                                            return null;
                                        }

                                        return [
                                            'date' => $r->date,
                                            'time' => $r->time,
                                            'suction_press' => $data['suction_press'] ?? 0,
                                            'discharge_press' => $data['discharge_press'] ?? 0,
                                            'flowrate' => $data['flowrate'] ?? 0,
                                        ];
                                    })
                                    ->filter()
                                    ->values();

                                $suctionTotal = $this->getAvgByHourRange($formattedReports, 'suction_press');
                                $flowrateTotal = $this->getAvgByHourRange($formattedReports, 'flowrate');

                                $report = (object) [
                                    'date' => $formattedDate,
                                    'suction_p' => round($suctionTotal, 2),
                                    'flowrate' => round($flowrateTotal, 2),
                                ];

                            } else {

                                $report = (object) [
                                    'date' => $formattedDate,
                                    'suction_p' => 0,
                                    'flowrate' => 0,
                                ];
                            }

                            // suction row
                            $rowSuction = $columns['{{header1_data}}']['row'] + $dayIndex;
                            $colSuction = $columns['{{header1_data}}']['column'];

                            $sheet->setCellValue(
                                $colSuction . $rowSuction,
                                $report->suction_p
                            );

                            // flowrate row
                            $rowFlowrate = $columns['{{header2_data}}']['row'] + $dayIndex;
                            $colFlowRate = $columns['{{header2_data}}']['column'];

                            $sheet->setCellValue(
                                $colFlowRate . $rowFlowrate,
                                $report->flowrate
                            );

                            // flowrate row
                            $performance_penalty = $columns['{{header3_data}}']['row'] + $dayIndex;
                            $suction = $colSuction . $rowSuction;
                            $flow = $colFlowRate . $rowFlowrate;

                            $formula = "=IF(AND($suction>=10,$flow<0.2),ROUND((0.2-$flow)*\$C\$2,0),0)";

                            $sheet->setCellValue(
                                $columns['{{header3_data}}']['column'] . $performance_penalty,
                                $formula
                            );
                            $dayIndex++;
                        }
                        $h3LastDataCol = $columns['{{header3_data}}']['column'];
                    }

                    foreach ($sheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            if ($cell->getValue() === '{{start_date}}') {
                                $cell->setValue($formattedStartDate);
                            }

                            // if ($cell->getValue() === '{{unit_sn}}') {
                            //     $cell->setValue($unitSn);
                            // }
                        }
                    }

                    $unitIndex++;
                }

                // Merge the H3 header to span all units' penalty data columns.
                // $h3ColIdx accumulated all H1/H2 block shifts, so it is the final header column.
                if ($clientUnits->count() > 1 && $h3ColIdx !== null && $h3LastDataCol !== null) {
                    $finalH3HeaderCol = Coordinate::stringFromColumnIndex($h3ColIdx);
                    if ($finalH3HeaderCol !== $h3LastDataCol) {
                        $sheet->mergeCells("{$finalH3HeaderCol}{$h3RowNum}:{$h3LastDataCol}{$h3RowNum}");
                    }
                }

                $unitIndex = 0;
                foreach ($clientUnits as $unitPos) {
                    $reports = $unitPos->reports->sortBy('date')->values();
                    $unitSn = $unitPos->unit->unit_sn ?: ($unitPos->unit->unit ?: 'UNKNOWN');
                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->unique('request_id')
                        ->values();

                    $availability = $this->calculateAvailabilityByRange($formattedRequests, ['start' => $startDate, 'end' => $endDate]);
                    $avgAvailability = $availability['average_availability'] ?? 0;
                    $availPlaceholder = [
                        '{{availability}}',
                        '{{unit_sn_avail}}',
                        '{{avail_penalty}}',
                        '{{total_avail_penalty}}',
                    ];

                    foreach ($spreadsheet->getAllSheets() as $nSheet) {
                        foreach ($nSheet->getRowIterator() as $row) {
                            foreach ($row->getCellIterator() as $cell) {
                                $value = $cell->getValue();
                                if (!in_array($value, $availPlaceholder)) {
                                    continue;
                                }
                                $columns[$value] = [
                                    'column' => $cell->getColumn(),
                                    'row' => $cell->getRow(),
                                ];
                                if ($unitIndex == 0) {
                                    $firstColRow[$value] = [
                                        'column' => $cell->getColumn(),
                                        'row' => $cell->getRow(),
                                    ];
                                }
                            }
                        }
                    }

                    $templateRow = 0;
                    $rowUnitSnAvail = $columns['{{unit_sn_avail}}']['row'] + $unitIndex;
                    $colUnitSnAvail = $columns['{{unit_sn_avail}}']['column'];

                    $rowAvailability = $columns['{{availability}}']['row'] + $unitIndex;
                    $colAvailability = $columns['{{availability}}']['column'];

                    $rowAvailPenalty = $columns['{{avail_penalty}}']['row'] + $unitIndex;
                    $colAvailPenalty = $columns['{{avail_penalty}}']['column'];
                    if (($clientUnits->count() > 1 && $clientUnits->count() != $unitIndex)) {
                        $rowIndex = $rowAvailability;
                        $insertRow = $rowUnitSnAvail;
                        $insertRowData = $rowUnitSnAvail;
                        $insertRow += 1;
                        $templateRow = $rowUnitSnAvail - $unitIndex;
                        $sheet->insertNewRowBefore($insertRow, 1);
                        $sheet->setCellValue(
                            $colUnitSnAvail . $insertRow,
                            $unitSn
                        );

                        $sheet->setCellValue(
                            $colAvailability . $insertRow,
                            $avgAvailability / 100
                        );

                        $sheet->setCellValue(
                            $colAvailPenalty . $insertRow,
                            "=IF(AND({$colAvailability}{$insertRowData}<95%,{$colAvailability}{$insertRowData}<>\"\"),ROUND((95%-{$colAvailability}{$insertRowData})*\$C\$2*\$H\$5,0),0)"
                        );
                        $rowIndex = $insertRow;
                    } else {
                        $sheet->setCellValue(
                            $colUnitSnAvail . $rowUnitSnAvail,
                            $unitSn
                        );

                        $sheet->setCellValue(
                            $colAvailability . $rowUnitSnAvail,
                            $avgAvailability / 100
                        );

                        $sheet->setCellValue(
                            $colAvailPenalty . $rowUnitSnAvail,
                            "=IF(AND({$colAvailability}{$rowUnitSnAvail}<95%,{$colAvailability}{$rowUnitSnAvail}<>\"\"),ROUND((95%-{$colAvailability}{$rowUnitSnAvail})*\$C\$2*\$H\$5,0),0)"
                        );
                        $rowIndex = $columns['{{total_avail_penalty}}']['row'];
                    }

                    $lastAvailRow = $rowIndex;
                    $unitIndex++;
                }
            }
            $highestRow = $sheet->getHighestRow();
            $startCol = $firstColRow['{{header1_data}}']['column'];
            $startRow = $firstColRow['{{header1_data}}']['row'];

            $totaAvailCol = $columns['{{avail_penalty}}']['column'];
            $totalAvailStartRow = $firstColRow['{{avail_penalty}}']['row'];
            $lastTotalAvailRow = $lastAvailRow;

            if ($clientUnits->count() > 1) {
                $shift = 0;
                $row = $startRow;

                while (
                    $row <= $highestRow &&
                    $sheet->getCell($columns['{{header2_data}}']['column'] . $row)->getValue() === null &&
                    // $sheet->getCell($columns['{{date}}']['column'] . $row)->getValue() === null &&
                    $sheet->getCell($columns['{{header1_data}}']['column'] . $row)->getValue() === null &&
                    $sheet->getCell($columns['{{header3_data}}']['column'] . $row)->getValue() === null
                ) {
                    $shift++;
                    $row++;
                }

                if ($shift > 0) {
                    $startCol = Coordinate::columnIndexFromString($firstColRow['{{date}}']['column']);
                    $endCol = Coordinate::columnIndexFromString($columns['{{header3_data}}']['column']);

                    for ($dstRow = $startRow; $dstRow <= $highestRow - $shift; $dstRow++) {

                        $srcRow = $dstRow + $shift;

                        for ($col = $startCol; $col <= $endCol; $col++) {

                            $colLetter = Coordinate::stringFromColumnIndex($col);

                            $src = $colLetter . $srcRow;
                            $dst = $colLetter . $dstRow;

                            $srcCell = $sheet->getCell($src);

                            if ($srcCell->isFormula()) {
                                $sheet->copyFormula($src, $dst);
                            } else {
                                $sheet->setCellValue($dst, $srcCell->getValue());
                            }

                            $sheet->duplicateStyle(
                                $sheet->getStyle($src),
                                $dst
                            );

                            // copy conditional formatting
                            $conditionalStyles = $sheet->getConditionalStyles($src);
                            if (!empty($conditionalStyles)) {
                                $sheet->setConditionalStyles($dst, $conditionalStyles);
                            }
                        }
                    }

                    for ($r = $highestRow - $shift + 1; $r <= $highestRow; $r++) {

                        for ($col = $startCol; $col <= $endCol; $col++) {

                            $colLetter = Coordinate::stringFromColumnIndex($col);
                            $cell = $colLetter . $r;

                            $sheet->getCell($cell)->setValue(null);
                            // $sheet->getStyle($cell)->getBorders()->setAllBorders(null);
                            $sheet->duplicateStyle(
                                $sheet->getStyle('A1'),
                                $cell
                            );

                            $sheet->removeConditionalStyles($cell);
                        }
                    }
                }

                for ($r = $templateRow; $r < $highestRow; $r++) {

                    if ($r <= $lastAvailRow + 1) {

                        $srcUnit = $colUnitSnAvail . ($r + 1);
                        $dstUnit = $colUnitSnAvail . $r;

                        $sheet->setCellValue($dstUnit, $sheet->getCell($srcUnit)->getValue());
                        $sheet->duplicateStyle($sheet->getStyle($srcUnit), $dstUnit);
                        $sheet->setCellValue($srcUnit, null);


                        $srcAvail = $colAvailability . ($r + 1);
                        $dstAvail = $colAvailability . $r;

                        $sheet->setCellValue($dstAvail, $sheet->getCell($srcAvail)->getValue());
                        $sheet->duplicateStyle($sheet->getStyle($srcAvail), $dstAvail);
                        $sheet->setCellValue($srcAvail, null);


                        $srcPenalty = $colAvailPenalty . ($r + 1);
                        $dstPenalty = $colAvailPenalty . $r;

                        $sheet->setCellValue($dstPenalty, $sheet->getCell($srcPenalty)->getValue());
                        $sheet->duplicateStyle($sheet->getStyle($srcPenalty), $dstPenalty);
                        $sheet->setCellValue($srcPenalty, null);
                    }
                }
            }
            $lastTouchColumns = [];
            foreach ($spreadsheet->getAllSheets() as $nSheet) {
                foreach ($nSheet->getRowIterator() as $row) {
                    foreach ($row->getCellIterator() as $cell) {
                        $value = $cell->getValue();
                        if (!in_array($value, $placeholders)) {
                            continue;
                        }
                        $lastTouchColumns[$value] = [
                            'column' => $cell->getColumn(),
                            'row' => $cell->getRow(),
                        ];
                    }
                }
            }
            $columnsToDelete = [];

            foreach ($lastTouchColumns as $data) {
                $columnsToDelete[] = $data['column'];
            }

            // hapus duplikat
            $columnsToDelete = array_unique($columnsToDelete);

            usort($columnsToDelete, function ($a, $b) {
                return Coordinate::columnIndexFromString($b)
                    - Coordinate::columnIndexFromString($a);
            });

            // Write the total avail penalty SUM before removing columns, because removeColumn
            // shifts the availability section left and would make the stored column reference stale.
            $sheet->setCellValue(
                $columns['{{total_avail_penalty}}']['column'] . $lastAvailRow,
                "=SUM({$totaAvailCol}{$totalAvailStartRow}:{$totaAvailCol}{$lastTotalAvailRow})"
            );

            // hapus kolom
            foreach ($columnsToDelete as $col) {
                $spreadsheet->getActiveSheet()->removeColumn($col, 1);
            }

            // ======================
            // SAVE FILE PER CLIENT
            // ======================

            $writer = new Xlsx($spreadsheet);
            $writer->setPreCalculateFormulas(false);

            $fileName = "Denda_{$unitPos->client->name}.xlsx";
            $filePath = $tempFolder . '/' . $fileName;
            $writer->save($filePath);

            $generatedFiles[] = $filePath;
        }

        // $sheet->setCellValue($colUnitSnAvail . $lastRow, null);
        // $sheet->setCellValue($colAvailability . $lastRow, null);


        // =====================
        // SINGLE FILE
        // =====================
        if (count($generatedFiles) === 1) {
            return response()->download(
                $generatedFiles[0],
                basename($generatedFiles[0]),
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]
            )->deleteFileAfterSend(true);
        }

        // =====================
        // MULTIPLE → ZIP
        // =====================

        $zipPath = $tempFolder . '/Penalty.zip';

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {

            foreach ($generatedFiles as $file) {
                $zip->addFile($file, basename($file));
            }

            $zip->close();
        }

        return response()->download(
            $zipPath,
            'Penalty.zip',
            ['Content-Type' => 'application/zip']
        )->deleteFileAfterSend(true);
    }
    // public function exportInvoice()
    // {
    //     // MATIIN output buffering
    //     if (ob_get_length()) {
    //         ob_end_clean();
    //     }

    //     $spreadsheet = new Spreadsheet();
    //     $sheet = $spreadsheet->getActiveSheet();
    //     $sheet->setCellValue('A1', 'TEST');

    //     return response()->streamDownload(function () use ($spreadsheet) {
    //         $writer = new Xlsx($spreadsheet);
    //         $writer->save('php://output');
    //     }, 'test.xlsx', [
    //         'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     ]);
    // }
}

?>