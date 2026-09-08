<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\DailyReport;
use App\Models\DataUnit;
use App\Models\StatusRequest;
use App\Models\UnitPosition;
use App\Models\UserSetting;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Str;

class StatusRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Show the form for creating a new resource.
     */
    // Membuat request status baru untuk sebuah unit (misal: shutdown, running, dll)
    public function setRequest(Request $request)
    {
        $val = $request->validate([
            'unit_id' => 'required|string',
            'start_date' => 'required|string',
            'start_time' => 'required|string',
            'request_type' => 'required|string',
            'remarks' => 'required|string',
            'unit_position_id' => 'required',
        ]);

        // Bulatkan waktu mulai ke jam penuh terdekat
        $start = Carbon::parse($val['start_time']);
        if ($start->minute > 0) {
            $start->addHour()->minute(0)->second(0);
        } else {
            $start->minute(0)->second(0);
        }
        $formatted = $start->format('H:i');

        // $unit = DailyReport::whereRelation('unitPosition', 'unit_id', $val['unit_id'])
        //     ->where('date', $val['start_date'])
        //     ->where('time', $formatted)
        //     ->first();

        // Ambil data posisi unit beserta relasi unit-nya
        $unitPosition = UnitPosition::with('unit')->find($val['unit_position_id']);

        // if (!$unit) {
        //     return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        // }

        $user = auth()->user();
        // Simpan record request status baru
        $status = new StatusRequest();
        $status->unit_position_id = $val['unit_position_id'];
        $status->start_date = $val['start_date'];
        $status->start_time = $val['start_time'];
        $status->request_type = $val['request_type'];
        $status->remarks = $val['remarks'];
        $status->status = 'Ongoing';
        $status->requested_by = $user->user_id;
        // $status->location_id = $val['location_id'];
        $status->save();
        // Update status unit sesuai tipe request yang diajukan
        $unitPosition->unit->update(['status' => $val['request_type']]);
        // if ($unit) {
        //     Log::debug($status);
        //     $unit->update(['request_id' => $status->request_id]);

        //     $unit->load(['request', 'unitPosition.unit']);
        //     if ($unit->request && $unit->unit_position && $unit->unit_position->unit) {
        //         $unit->unit_position->unit->update([
        //             'status' => $unit->request->request_type
        //         ]);
        //     }
        //     // return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        // }

        try {
            // Cari teknisi yang ditugaskan pada unit ini untuk dikirim notifikasi WhatsApp
            $technicians = UserSetting::with(['user', 'unitArea'])
                ->whereHas('unitArea', function ($query) use ($val) {
                    $query->where('unit_id', $val['unit_id']);
                })
                ->get();

            $unitData = $unitPosition->unit;
            // Ambil nomor WhatsApp teknisi yang valid
            $numbers = $technicians
                ->filter(fn($tech) => !empty($tech->user->whatsAppNum))
                ->map(fn($tech) => $tech->user->whatsAppNum)
                ->implode(',');
            if (!empty($numbers)) {
                // $link = route('request.seen', ['id' => $status->request_id]);
                $link = "/request/seen/" . $status->request_id;
                // $full = 'https://vncdev-sinerco.my.id/unit-setting';
                $full = url($link);
                // Kirim notifikasi WhatsApp ke teknisi terkait
                WhatsAppService::sendMessage($numbers, "A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['start_date']}\nStart Time: {$val['start_time']}\nRequest Type: {$val['request_type']}\nRemarks: {$val['remarks']}\n\nConfirm here:\n{$full}");
            }
            // $link = 'https://vncdev-sinerco.my.id/unit-setting';
            // WhatsAppService::sendMessage('082113837546', "A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['start_date']}\nStart Time: {$val['start_time']}\nRequest Type: {$val['request_type']}\nRemarks: {$val['remarks']}\n\nConfirm here:\n{$link}\n");

            return response()->json(['type' => 'success', 'text' => 'Request created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    // Menampilkan halaman utama fitur Request
    public function getRequest()
    {
        return Inertia::render('Request/Request');
    }

    // Mengambil seluruh riwayat request untuk unit yang diizinkan bagi user
    public function getRequestHistory()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unit_ids = collect($permissionData)->pluck('unit_position_id')->unique()->filter();

        $requestList = StatusRequest::whereIn('unit_position_id', $unit_ids)->with('unitPosition', 'user', 'pic')->get();
        $requestList = collect($requestList)
            ->values();
        // ->toArray();

        // Format data request menjadi struktur yang siap dikirim ke frontend
        $data = $requestList->map(function ($req) {
            return [
                'request_id' => $req->request_id,
                'action' => $req->action,
                'end_date' => $req->end_date,
                'end_time' => $req->end_time,
                'pic' => $req?->pic?->name,
                'remarks' => $req->remarks,
                'request_type' => $req->request_type,
                'requested_by' => $req->user->name,
                'seen_status' => (bool) $req->seen_status,
                'start_date' => $req->start_date,
                'start_time' => $req->start_time,
                'status' => $req->status,
                'unit' => $req->unitPosition->unit->unit,
                'area' => $req->unitPosition->location->area->area,
                'location' => $req->unitPosition->location->location,
            ];
        });

        return response()->json($data);
    }

    // Mengambil daftar unit yang masih memiliki request aktif (status belum 'End')
    public function getRequestedUnit()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unit_ids = collect($permissionData)->pluck('unit_position_id')->unique()->filter();

        $requestList = StatusRequest::whereIn('unit_position_id', $unit_ids)
            ->with('unitPosition', 'user', 'location.area', 'pic')
            ->where('status', '!=', 'End')->get();
        $requestList = collect($requestList)
            ->values();
        // ->toArray();
        $data = $requestList->map(function ($req) {
            return [
                'location' => $req->unitPosition->location->location ?? null,
                'request_id' => $req->request_id,
                'action' => $req->action,
                'end_date' => $req->end_date,
                'end_time' => $req->end_time,
                'pic' => $req?->pic?->name,
                'remarks' => $req->remarks,
                'request_type' => $req->request_type,
                'requested_by' => $req->user->name,
                'seen_status' => $req->seen_status,
                'start_date' => $req->start_date,
                'start_time' => $req->start_time,
                'status' => $req->status,
                'unit' => $req->unitPosition->unit->unit,
            ];
        });
        return response()->json($data);
    }

    // Mengambil 5 request terbaru (untuk widget/dashboard)
    public function getFiveRequestedUnit()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unit_ids = collect($permissionData)->pluck('unit_position_id')->unique()->filter();

        $requestList = StatusRequest::whereIn('unit_position_id', $unit_ids)
            ->with('unitPosition', 'user', 'location.area', 'pic')
            ->latest()
            ->take(5)
            ->get();
        $requestList = collect($requestList)
            ->values();
        // ->toArray();
        $data = $requestList->map(function ($req) {
            return [
                'location' => $req->unitPosition->location->location ?? null,
                'request_id' => $req->request_id,
                'action' => $req->action,
                'end_date' => $req->end_date,
                'end_time' => $req->end_time,
                'pic' => $req?->pic?->name,
                'remarks' => $req->remarks,
                'request_type' => $req->request_type,
                'requested_by' => $req->user->name,
                'seen_status' => $req->seen_status,
                'start_date' => $req->start_date,
                'start_time' => $req->start_time,
                'status' => $req->status,
                'unit' => $req->unitPosition->unit->unit,
            ];
        });
        return response()->json($data);
    }

    // Mengupdate data request (misal: mengisi waktu selesai / mengubah status)
    public function updateRequest(Request $request)
    {
        // Hanya role tertentu yang boleh mengedit request
        $userRole = auth()->user()?->roleData?->name;
        if (!in_array($userRole, ['operator', 'super_admin', 'technician'])) {
            return response()->json(['type' => 'error', 'text' => 'You are not authorized to edit this request.'], 403);
        }

        $val = $request->validate([
            // 'unit_position_id' => 'required|string',
            'start_date' => 'nullable|string',
            'start_time' => 'nullable|string',
            'request_id' => 'required|string',
            // 'status' => 'required|string',
            'end_time' => 'nullable|string',
            'end_date' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);
        $status = StatusRequest::with('unitPosition.unit')->where('request_id', $request->request_id)->first();
        // $status = StatusRequest::with('unit_position')->where('request_id', $request->request_id)->first();

        // if ($val['start_time'] || $val['start_date']) {
        //     $start_time = $val['start_time'] ?? $status->start_time;
        //     $start_date = $val['start_date'] ?? $status->start_date;

        //     $start = Carbon::parse($start_time);
        //     if ($start->minute > 0) {
        //         $start->addHour()->minute(0)->second(0);
        //     } else {
        //         $start->minute(0)->second(0);
        //     }
        //     $formatted = $start->format('H:i');
        //     $formatted = $start->format('H:i');

        //     $unit = DailyReport::whereRelation('unitPosition', 'unit_id', $status->unit_id)
        //         ->where('date', $val['start_date'])
        //         ->where('time', $formatted)
        //         ->first();

        //     if ($unit) {
        //         Log::debug($status);
        //         $unit->update(['request_id' => $status->request_id]);

        //         $unit->load(['request', 'unitPosition.unit']);
        //         if ($unit->request && $unit->unit_position && $unit->unit_position->unit) {
        //             $unit->unit_position->unit->update([
        //                 'status' => $unit->request->request_type
        //             ]);
        //         }
        //         // return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        //     }
        // }

        if (!$status) {
            return back()->with('status', 'Request not found.');
        }

        $currStatus = $status->status;
        // Update status and end time
        // Jika belum ada tanggal/waktu selesai, status tetap "Ongoing"
        if (!$val['end_date'] || !$val['end_time']) {
            $status->status = "Ongoing";
        }
        ;
        // Jika sebelumnya Ongoing dan sekarang end_date & end_time diisi, ubah status jadi "End"
        if ($currStatus === "Ongoing" && ($val['end_time'] && $val['end_date'])) {
            $status->status = "End";
        }
        ;
        $status->start_time = $request->start_time ?? $status->start_time;
        $status->start_date = $request->start_date ?? $status->start_date;
        $status->end_time = $request->end_time ?? null;
        $status->end_date = $request->end_date ?? null;
        $status->remarks = $request->remarks ?? $status->remarks;

        // Handle unit status updates if the relationship is loaded
        $unitData = $status->unitPosition->unit;
        if ($unitData) {
            // Tentukan status unit baru berdasarkan status request saat ini
            $newUnitStatus = match ($status->status) {
                'Ongoing' => $status->request_type,
                'End' => 'running',
                default => "null",
            };

            if ($newUnitStatus) {
                $unitData->update(['status' => $newUnitStatus]);
            }
        }

        // Handle notification
        // Buat atau perbarui notifikasi admin terkait request ini
        $notification = AdminNotification::firstOrNew(['request_id' => $status->request_id]);
        $notification->date = $status->start_date;
        $notification->time = $status->start_time;
        $notification->request_type = $status->request_type;
        $notification->status = $status->status;
        $notification->save();

        // Save status
        $status->save();

        return response()->json([
            'type' => 'success',
            'text' => 'Request Saved',
        ]);

    }

    // Menandai request sebagai sudah/belum dilihat oleh teknisi (via link WhatsApp)
    public function seenRequest(Request $request, $id)
    {
        if (!$id) {
            return response()->json([
                'type' => 'error',
                'text' => 'No ID provided.',
            ], 400);
        }
        $user = $request->user();
        $user->load('roleData');
        if (!$user && !$user->user_id) {
            return response()->json([
                'type' => 'error',
                'text' => 'User Not Found',
            ], 400);
        }
        // Hanya role technician yang boleh menandai request sebagai "seen"
        if ($user->roleData?->name != 'technician') {
            return response()->json([
                'type' => 'error',
                'text' => 'Unauthorized',
            ], 400);
        }
        $selectedReq = StatusRequest::where('request_id', $id)->first();

        if (!$selectedReq) {
            return response()->json([
                'type' => 'error',
                'text' => "Request with ID {$id} not found.",
            ], 404);
        }
        // Toggle status seen: jika sudah dilihat, reset; jika belum, tandai dilihat sekarang
        if ($selectedReq->seen_status) {
            $selectedReq->update(['seen_status' => !$selectedReq->seen_status, 'seen_time' => null, 'seen_by' => null]);
        } else {
            $selectedReq->update(['seen_status' => !$selectedReq->seen_status, 'seen_time' => now(), 'seen_by' => $user->user_id]);
        }
        return response()->json([
            'type' => 'success',
            'text' => 'Request seen status updated.',
        ]);
    }


    // MOVE TO HISTORY

    // Memindahkan request terpilih ke tabel history (arsip) lalu menghapus dari tabel utama
    public function moveToHistory(Request $request)
    {
        $ids = $request->ids; // array of selected request IDs

        if (!$ids || !is_array($ids)) {
            return response()->json(['message' => 'No requests selected'], 400);
        }

        $requests = StatusRequest::whereIn('request_id', $ids)->get();

        foreach ($requests as $req) {
            // Ensure requested_by exists in users table
            // Pastikan user pengaju masih ada, jika tidak set null
            $requestedBy = \DB::table('users')->where('user_id', $req->requested_by)->exists()
                ? $req->requested_by
                : null; // or some default user ID

            // Insert into history table
            // Simpan data ke tabel arsip/history
            DB::table('history_status_requests')->insert([
                'request_id' => $req->request_id,
                'action' => $req->action,
                'end_date' => $req->end_date,
                'end_time' => $req->end_time,
                'remarks' => $req->remarks,
                'request_type' => $req->request_type,
                'requested_by' => $requestedBy,
                'seen_status' => $req->seen_status,
                'start_date' => $req->start_date,
                'start_time' => $req->start_time,
                'status' => $req->status,
                'unit_position_id' => $req->unit_position_id,
                'trashed_at' => now(),
            ]);

            // Delete from original table
            // Hapus data asli setelah dipindahkan ke history
            $req->delete();
        }

        return response()->json(['type' => 'success', 'text' => 'Request trashed!']);
    }

}
