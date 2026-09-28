<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;

// Notifikasi admin untuk alarm SD/STBY -- 1 baris per StatusRequest (auto-dibuat
// oleh StatusRequest model, lihat boot() di app/Models/StatusRequest.php).
// getNotifications() di-poll tiap 10 detik oleh PageLayout.jsx buat nyalain alarm
// bunyi/popup di semua halaman selama masih ada request yang statusnya bukan 'End'.
// Request bertipe 'note' sengaja dikecualikan di sini (tidak pernah bikin alarm).
class AdminNotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getNotifications()
    {
        // Ambil daftar unit yang diizinkan untuk user saat ini
        $permissionData = DataUnitController::getPermittedUnit();

        // Ambil id unit unik dari data izin, buang yang kosong
        $unitIds = collect($permissionData)
            ->pluck('unit_position_id')
            ->unique()
            ->filter();

        // Ambil notifikasi yang statusnya belum 'End' dan unit-nya termasuk yang diizinkan
        $requestList = AdminNotification::where('status', '!=', 'End')
            ->where('request_type', '!=', 'note')
            ->whereHas('request', function ($query) use ($unitIds) {
                $query->whereIn('unit_position_id', $unitIds);
            })
            ->with('request')
            ->get()
            // Kelompokkan berdasarkan tipe request
            ->groupBy(function ($item) {
                return $item->request_type ?? null;
            })
            // Ambil satu data pertama tiap kelompok
            ->map->first()
            ->values();


        return response()->json($requestList);
    }
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AdminNotification $adminNotification)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdminNotification $adminNotification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdminNotification $adminNotification)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdminNotification $adminNotification)
    {
        //
    }
}
