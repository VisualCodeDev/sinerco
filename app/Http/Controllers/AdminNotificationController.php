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
        return response()->json(AdminNotification::where('status', '!=', 'End')->get());
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
