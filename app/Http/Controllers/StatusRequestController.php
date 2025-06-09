<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\DataUnit;
use App\Models\StatusRequest;
use App\Models\UserAllocation;
use App\Services\WhatsAppService;
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
            'unitId' => 'required|string',
            'startDate' => 'required|string',
            'startTime' => 'required|string',
            'requestType' => 'required|string',
            'remarks' => 'required|string',
        ]);

        try {
            $technicians = UserAllocation::with(['user', 'unitArea'])
                ->whereHas('unitArea', function ($query) use ($val) {
                    $query->where('unitId', $val['unitId']);
                })
                ->get();

            $unitData = DataUnit::where('unitId', $val['unitId'])->first();
            $numbers = $technicians
                ->filter(fn($tech) => !empty($tech->user->whatsAppNum))
                ->map(fn($tech) => $tech->user->whatsAppNum)
                ->implode(',');

            if (!empty($numbers)) {
                WhatsAppService::sendMessage($numbers, "TEST: A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['startDate']}\nStart Time: {$val['startTime']}\nRequest Type: {$val['requestType']}\nRemarks: {$val['remarks']}");
            }
            $user = auth()->user();
            $status = new StatusRequest();
            $status->unitId = $val['unitId'];
            $status->startDate = $val['startDate'];
            $status->startTime = $val['startTime'];
            $status->requestType = $val['requestType'];
            $status->remarks = $val['remarks'];
            $status->status = 'Pending';
            $status->requestedBy = $user->id;
            $status->save();

            return response()->json(['type' => 'success', 'text' => 'Request created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }
    public function getRequest()
    {
        $status = StatusRequest::with(['unit', 'user'])->orderBy('created_at', 'desc')->get();
        return Inertia::render('Request/Request', ['data' => $status]);
    }

    public function updateRequest(Request $request)
    {
        $request->validate([
            'requestId' => 'required|string',
            'status' => 'required|string',
            'endTime' => 'nullable|string',
            'endDate' => 'nullable|string',
        ]);
        $status = StatusRequest::with('unit')->where('requestId', $request->requestId)->first();

        if (!$status) {
            return back()->with('status', 'Request not found.');
        }

        // Update status and end time
        $status->status = $request->status;
        $status->endTime = $request->endTime ?? null;
        $status->endDate = $request->endDate ?? null;

        // Handle unit status updates if the relationship is loaded
        if ($status->unit) {
            $newUnitStatus = match ($status->status) {
                'Ongoing' => $status->requestType,
                'End' => 'online',
                default => null,
            };

            if ($newUnitStatus) {
                $status->unit->update(['status' => $newUnitStatus]);
            }
        }

        // Handle notification
        $notification = AdminNotification::firstOrNew(['requestId' => $status->requestId]);
        $notification->date = $status->startDate;
        $notification->time = $status->startTime;
        $notification->requestType = $status->requestType;
        $notification->status = $status->status;
        $notification->save();

        // Save status
        $status->save();

        return response()->json([
            'type' => 'success',
            'text' => 'Request Saved',
        ]);

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
