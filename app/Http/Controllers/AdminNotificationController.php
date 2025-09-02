<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getNotifications()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unitIds = collect($permissionData)
            ->pluck('unit_position_id')
            ->unique()
            ->filter();

        $requestList = AdminNotification::where('status', '!=', 'End')
            ->whereHas('request', function ($query) use ($unitIds) {
                $query->whereIn('unit_position_id', $unitIds);
            })
            ->with(['request'])
            ->get();

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
