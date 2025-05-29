<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\StatusRequest;
use DB;
use Illuminate\Http\Request;
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
    public function setRequest(Request $request)
    {
        $val = $request->validate([
            'startDate' => 'required|string',
            'startTime' => 'required|string',
            'requestType' => 'required|string',
            'remarks' => 'required|string',
        ]);

        try {
            $status = new StatusRequest();
            $status->startDate = $val['startDate'];
            $status->startTime = $val['startTime'];
            $status->requestType = $val['requestType'];
            $status->remarks = $val['remarks'];
            $status->status = 'Pending';
            $status->save();

            return back();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getRequest()
    {
        $status = StatusRequest::all();
        return Inertia::render('Request', ['data' => $status]);
    }

    public function updateRequest(Request $request)
    {
        $request->validate([
            'requestId' => 'required|string',
            'status' => 'required|string',
            'endTime' => 'nullable|string',
            'endDate' => 'nullable|string',
            'action' => 'nullable|string',
        ]);
        $status = StatusRequest::where('requestId', $request->requestId)->first();
        if ($status) {
            $status->status = $request->status;
            if ($request->endTime && $request->endDate) {
                $status->endTime = $request->endTime;
                $status->endDate = $request->endDate;
                $status->action = $request->action;
            } else {
                $status->endTime = null;
                $status->endDate = null;
                $status->action = '';
            }
            if ($status->status === "End") {
                $notification = AdminNotification::where('requestId', $request->requestId)->first();
                $notification->status = $request->status;
                $notification->save();
            } else {
                $notification = AdminNotification::where('requestId', $request->requestId)->first();
                $notification->requestId = $status->requestId;
                $notification->date = $status->startDate;
                $notification->time = $status->startTime;
                $notification->requestType = $status->requestType;
                $notification->status = $status->status;
                $notification->save();
            }
            $status->save();
            return back()->with('status', 'success');
        }

        return back()->with('status', 'failed');
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
    public function show(StatusRequest $statusRequest)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StatusRequest $statusRequest)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StatusRequest $statusRequest)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StatusRequest $statusRequest)
    {
        //
    }
}
