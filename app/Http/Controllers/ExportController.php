<?php

namespace App\Http\Controllers;

use App\Models\UnitPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use ZipArchive;
use PhpOffice\PhpWord\TemplateProcessor;
use Carbon\Carbon;


class ExportController extends Controller
{
    public function exportBa_stdby_sd($request_type, $unit, $location, $events, $client, $name, $department, $client_name, $client_department) {
        // 1. Ambil template
        $templatePath = storage_path('../app/templates/TEMPLATE_SD_STDBY.docx');
        $template = new TemplateProcessor($templatePath);

        // 2. Set variabel statis
        $template->setValue('request_type', $request_type);
        $template->setValue('unit', $unit);
        $template->setValue('location', $location);
        $template->setValue('client', strtoupper($client));
        $template->setValue('name', strtoupper($name));
        $template->setValue('department',strtoupper( $department));
        $template->setValue('client_name',strtoupper( $client_name));
        $template->setValue('client_department',strtoupper( $client_department));

        // 3. Data list dinamis (Gunakan $events, bukan data dummy)
        $list = $events; // Gunakan data yang dilewatkan

        // 4. Clone row tabel
        if (count($list) > 0) {
            $template->cloneRow('no', count($list));
        } else {
            // Handle jika list kosong agar TemplateProcessor tidak error
            // (tergantung template Anda)
            // Di sini diasumsikan ada 1 baris placeholder minimal
            $template->cloneRow('no', 1);
            $template->setValue("no#1", '');
            $template->setValue("start_time#1", '');
            $template->setValue("end_time#1", '');
            $template->setValue("duration#1", '');
            $template->setValue("remarks#1", 'Tidak ada data');
        }


        foreach ($list as $index => $row) {
            $i = $index + 1; // 1-based
            $template->setValue("no#$i", $i);
            // Sesuaikan nama field jika Anda menggunakan $events dari exportDoc
            // (Di sini fieldnya 'start', 'end', 'duration', 'remarks')
            $template->setValue("start_time#$i", $row['start']);
            $template->setValue("end_time#$i", $row['end']);
            $template->setValue("duration#$i", $row['duration']);
            $template->setValue("remarks#$i", $row['remarks']);
        }


        // Nama file perlu lebih unik per unit/request_type
        $safeUnitName = str_replace(' ', '_', $unit);
        $safeRequestType = str_replace(' ', '_', strtolower($request_type));
        $filename = "{$safeUnitName}_{$safeRequestType}_" . date('Ymd_His') . '.docx';

        // Simpan ke direktori yang mudah diakses dan dihapus
        $path = storage_path("app/temp/$filename");
        
        // Pastikan direktori 'temp' ada
        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        $template->saveAs($path);

        // Kembalikan path file yang baru dibuat
        return $path;
    }

    public function exportDoc(Request $request)
    {
        $validated = $request->validate([
            'unit_pos_id' => 'required|array',
            'name' => 'string',
            'client_name' => 'string',
            'client_department' => 'string',
            'department' => 'string',
        ]);

        $unitPosIds = $validated['unit_pos_id'];

        $units = UnitPosition::whereIn('id', $unitPosIds)->with(['requests', 'unit', 'location.area', 'client'])->get();

        // Persiapan ZIP
        $zipFileName = 'Laporan_' . date('Ymd_His') . '.zip';
        $zipPath = storage_path("app/public/$zipFileName");

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new \Exception("Tidak dapat membuat file ZIP");
        }

        $filePaths = []; // Untuk menyimpan path file yang akan di-ZIP

        foreach ($units as $unit) {
            $name = $request->name ?? 'name';
            $department = $request->department ?? 'department';
            $client_name = $request->client_name ?? 'client name';
            $client_department = $request->client_department ?? 'client department';
            $unitName = $unit->unit->unit;
            $location = $unit->location->location;
            $requests = $unit->requests;
            $client = $unit->client->name;
            $transformed = $requests->map(function ($req) {
                // Convert start & end date + time
                $start = Carbon::parse($req->start_date . ' ' . $req->start_time);
                $end = Carbon::parse($req->end_date . ' ' . $req->end_time);

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
                    'start'=> $start->format('d F Y') . ', ' . $start->format('H:i'),
                    'end'=> $end->format('d F Y') . ', ' . $end->format('H:i'),
                    'remarks'=> $req->remarks,
                    'duration' => $duration,
                    'request_type'=> $req->request_type
                ];
            });

            // Filter
            $shutdown = $transformed->filter(function ($req) {
                return $req['request_type'] === 'sd';
            });

            $standby = $transformed->filter(function ($req) {
                return $req['request_type'] === 'stdby';
            });

            
            if($shutdown->isNotEmpty()){
                $filePath = $this->exportBa_stdby_sd('SHUTDOWN', $unitName, $location, $shutdown->values(), $client, $name, $department, $client_name, $client_department);
                $filePaths[] = $filePath;
            }

            if($standby->isNotEmpty()){
                $filePath = $this->exportBa_stdby_sd('STANDBY', $unitName, $location, $standby->values(), $client, $name, $department, $client_name, $client_department);
                $filePaths[] = $filePath;
            }
        }

        // Tambahkan semua file Word ke ZIP
        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                $zip->addFile($filePath, basename($filePath)); 
            } else {
                Log::error("File tidak ditemukan saat di-zip: $filePath");
            }
        }

        $zip->close();
        if (ob_get_level()) {
            ob_end_clean();
        }
        return response()->download($zipPath)->deleteFileAfterSend(true);
        
        // Hapus file Word temporary
        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }
}

?>