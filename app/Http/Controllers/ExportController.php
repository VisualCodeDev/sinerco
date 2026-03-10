<?php

namespace App\Http\Controllers;

use App\Models\DailyReport;
use Carbon\CarbonPeriod;
use Carbon\Carbon;
use App\Models\UnitPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;
use PhpOffice\PhpWord\TemplateProcessor;


class ExportController extends Controller
{
    private function calculateDailyStatus($requests, string $date)
    {
        $dayStart = Carbon::parse($date)->startOfDay();
        $dayEnd = Carbon::parse($date)->endOfDay();
        $downSeconds = 0;
        $standbySeconds = 0;
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
            $durationSeconds = $start->diffInSeconds($end);

            // assign durasi
            if ($req->request_type === 'sd') {
                $downSeconds += $durationSeconds;
            }
            if ($req->request_type === 'stdby') {
                $standbySeconds += $durationSeconds;
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

        $downHours = round($downSeconds / 3600, 2);
        $standbyHours = round($standbySeconds / 3600, 2);
        $runningHours = round(24 - ($downHours + $standbyHours), 2);

        return [
            'running' => max($runningHours, 0),
            'standby' => min(24, $standbyHours),
            'down' => min(24, $downHours),
            'remarks' => implode("\n", $remarksArr) // semua request hari ini
        ];
    }
    private function calculateAvailabilityByRange($requests, array $rangeDate = null)
    {
        if (empty($range)) {
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

    public function exportBap($client_name, $client_department, $client, $area, $pic_name, $pic_department, $listData, $spv_name, $spv_department, $rangeDate, $templateType)
    {
        // dd($area);
        // 1. Ambil template
        switch ($templateType) {
            case 1:
                $templatePath = storage_path('../app/templates/Template_JAS_BAP.docx');
                break;
            case 2:
                $templatePath = storage_path('../app/templates/Template_Kampar_BAP.docx');
                break;
            case 3:
                $templatePath = storage_path('../app/templates/Template_Sangasanga_BAP.docx');
                break;
            case 4:
                $templatePath = storage_path('../app/templates/Template_Sindang_BAP.docx');
                break;
            default:
                $templatePath = storage_path('../app/templates/Template_Tambun_BAP.docx');
                break;
        }
        // switch ($area) {
        //     case 'Jati Asri':
        //         $templatePath = storage_path('../app/templates/Template_JAS_BAP.docx');
        //     case 'Kampar':
        //         $templatePath = storage_path('../app/templates/Template_Kampar_BAP.docx');
        //     case 'Sangasanga':
        //         $templatePath = storage_path('../app/templates/Template_Sangasanga_BAP.docx');
        //     case 'Sindang':
        //         $templatePath = storage_path('../app/templates/Template_Sindang_BAP.docx');
        //     default:
        //         // $templatePath = storage_path('../app/templates/Template_Sindang_BAP.docx');
        //         $templatePath = storage_path('../app/templates/Template_Tambun_BAP.docx');

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

    public function exportBapm($unit, $location, $area, $events, $client, $name, $department, $client_name, $client_department)
    {
        // 1. Ambil template
        $templatePath = storage_path('../app/templates/Template_BAPM.docx');
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

    public function exportBa_stdby_sd($request_type, $unit, $location, $events, $client, $name, $department, $client_name, $client_department)
    {
        // 1. Ambil template
        $templatePath = storage_path('../app/templates/TEMPLATE_SD_STDBY.docx');
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
    public function exportDoc(Request $request)
    {
        $validated = $request->validate([
            'unit_pos_id' => 'required|array',
            'ba_req' => 'required|boolean',
            'bapm' => 'required|boolean',
            'bap' => 'required|boolean',
            'month' => 'required_if:bap,true|integer|between:1,12',
            'template' => 'required_if:bap,true|integer|between:1,5',
        ]);
        // dd($validated['bapm']);
        $unitPosIds = $validated['unit_pos_id'];

        $units = UnitPosition::whereIn('id', $unitPosIds)->with(['requests', 'unit', 'location.area', 'client', 'baSettings', 'reports'])->get();

        $zipFileName = 'Laporan_' . date('Ymd_His') . '.zip';
        $zipPath = storage_path("app/public/$zipFileName");
        $allFiles = [];

        if ($validated['bapm'] || $validated['ba_req']) {
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

                // Filter
                $shutdown = $transformed->filter(function ($req) {
                    return $req['request_type'] === 'sd';
                });

                $standby = $transformed->filter(function ($req) {
                    return $req['request_type'] === 'stdby';
                });

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
                    $validated['template']
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

    private function hoursToHMS($hours)
    {
        $h = floor($hours);
        $m = floor(($hours - $h) * 60);
        $s = round((($hours - $h) * 60 - $m) * 60);

        return sprintf('%02d:%02d', $h, $m);
    }
    public function exportInvoice(Request $request)
    {
        $validated = $request->validate([
            'clients' => 'required|array',
            'clients.*' => 'exists:clients,client_id'
        ]);

        if (ob_get_length()) {
            ob_end_clean();
        }

        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $unitPositions = UnitPosition::whereIn('client_id', $validated['clients'])
            ->with([
                'unit',
                'reports.request',
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

        foreach ($groupedByClient as $clientId => $clientUnits) {

            $templatePath = storage_path('../app/templates/Template_inv.xlsx');
            $spreadsheet = IOFactory::load($templatePath);

            $baseSheet = $spreadsheet->getActiveSheet();
            $templateSheet = clone $baseSheet;
            $sheet = null;
            $sheetIndex = 0;
            if (!empty($clientUnits)) {
                foreach ($clientUnits as $unitPos) {
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
                    $i = 1;

                    // while ($spreadsheet->sheetNameExists($sheetName)) {
                    //     $sheetName = $baseName . '_' . $i;
                    //     $i++;
                    // }

                    $sheet->setTitle($sheetName);
                    // dd($sheet->getTitle());
                    $reports = $unitPos->reports->sortBy('date')->values();

                    // replace {{unit_sn}}
                    foreach ($sheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            if ($cell->getValue() === '{{unit_sn}}') {
                                $cell->setValue($unitSn);
                            }
                        }
                    }
                    // ===== cari template row =====
                    $templateRow = null;

                    foreach ($sheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            if ($cell->getValue() === '{{date}}') {
                                $templateRow = $cell->getRow();
                                break 2;
                            }
                        }
                    }

                    if (!$templateRow) {
                        abort(300, 'Template row {{date}} not found.');
                    }

                    // =====================
                    // WRITE DATA (kode kamu tetap sama)
                    // =====================

                    $currentRow = $templateRow;
                    $totalRow = 37;

                    $startDate = Carbon::create($year, $month, 1);
                    $endDate = $startDate->copy()->endOfMonth();
                    $period = CarbonPeriod::create($startDate, $endDate);

                    $reportsGrouped = $reports->groupBy(function ($r) {
                        return Carbon::parse($r->date)->format('Y-m-d');
                    });

                    $formattedRequests = $reports
                        ->map(fn($r) => $r->request)
                        ->filter()
                        ->values();

                    $availability = $this->calculateAvailabilityByRange($formattedRequests);

                    foreach ($period as $date) {

                        $dateString = $date->format('Y-m-d');
                        $run = $availability["daily"][$dateString]['running'] ?? 0;
                        $stdby = $availability["daily"][$dateString]['standby'] ?? 0;
                        $sd = $availability["daily"][$dateString]['down'] ?? 0;
                        $remarks = $availability["daily"][$dateString]['remarks'] ?? '';

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
                                    ];
                                })
                                ->filter()
                                ->values();

                            $suctionTotal = $this->getAvgByHourRange($formattedReports, 'suction_press');
                            $dischargeTotal = $this->getAvgByHourRange($formattedReports, 'discharge_press');
                            $flowrateTotal = $this->getAvgByHourRange($formattedReports, 'flowrate');
                            $report = (object) [
                                'date' => $date->translatedFormat('j M'),
                                'suction_p' => round($suctionTotal, 2),
                                'discharge_p' => round($dischargeTotal, 2),
                                'flowrate' => round($flowrateTotal, 2),
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
                                'run' => $this->hoursToHMS($run),
                                'stby' => $this->hoursToHMS($stdby),
                                'down' => $this->hoursToHMS($sd),
                                'remarks' => $remarks,
                            ];
                        }

                        $sheet->setCellValue("A$currentRow", $report->date);
                        $sheet->setCellValue("C$currentRow", $report->suction_p);
                        $sheet->setCellValue("D$currentRow", $report->discharge_p);
                        $sheet->setCellValue("E$currentRow", $report->flowrate);
                        $sheet->setCellValue("K$currentRow", $run / 24);
                        $sheet->setCellValue("L$currentRow", $stdby / 24);
                        $sheet->setCellValue("M$currentRow", $sd / 24);
                        $sheet->getStyle("K$currentRow:M$currentRow")
                            ->getNumberFormat()
                            ->setFormatCode('[h]:mm:ss');

                        $sheet->setCellValue("T$currentRow", $report->remarks);

                        $currentRow++;
                    }
                    $sheetIndex++;
                }
            }
            // ======================
            // SAVE FILE PER CLIENT
            // ======================

            $writer = new Xlsx($spreadsheet);
            $writer->setPreCalculateFormulas(false);

            $fileName = "Monthly_Report_{$unitSn}.xlsx";
            $filePath = $tempFolder . '/' . $fileName;
            $writer->save($filePath);

            $generatedFiles[] = $filePath;
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

        $zipPath = $tempFolder . '/Monthly_Reports.zip';

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {

            foreach ($generatedFiles as $file) {
                $zip->addFile($file, basename($file));
            }

            $zip->close();
        }

        return response()->download(
            $zipPath,
            'Monthly_Reports.zip',
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