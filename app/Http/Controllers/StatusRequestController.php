<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\DataUnit;
use App\Models\StatusRequest;
use App\Models\UserAllocation;
use App\Services\WhatsAppService;
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
    public function setRequest(Request $request)
    {
        $val = $request->validate([
            'unitId' => 'required|string',
            'startDate' => 'required|string',
            'startTime' => 'required|string',
            'requestType' => 'required|string',
            'remarks' => 'required|string',
            'locationId' => 'required',
        ]);
        $user = auth()->user();
        $status = new StatusRequest();
        $status->unitId = $val['unitId'];
        $status->startDate = $val['startDate'];
        $status->startTime = $val['startTime'];
        $status->requestType = $val['requestType'];
        $status->remarks = $val['remarks'];
        $status->status = 'Pending';
        $status->requestedBy = $user->id;
        $status->locationId = $val['locationId'];
        $status->save();
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
                $link = route('request.seen', ['id' => $status->requestId]);

                WhatsAppService::sendMessage($numbers, "TEST: A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['startDate']}\nStart Time: {$val['startTime']}\nRequest Type: {$val['requestType']}\nRemarks: {$val['remarks']}\n\nConfirm here: {$link}");
            }

            return response()->json(['type' => 'success', 'text' => 'Request created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }
    public function getRequest()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unitIds = collect($permissionData)->pluck('unitId')->unique()->filter();

        $requestList = StatusRequest::whereIn('unitId', $unitIds)->with('unit', 'user')->get();
        $requestList = collect($requestList)
            ->values()
            ->toArray();
        ;

        return Inertia::render('Request/Request', ['data' => $requestList]);
    }

    public function getRequestedUnit()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unitIds = collect($permissionData)->pluck('unitId')->unique()->filter();

        $requestList = StatusRequest::whereIn('unitId', $unitIds)->with('unit', 'user', 'location.area')->get();
        $requestList = collect($requestList)
            ->values()
            ->toArray();
        return response()->json($requestList);
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

    public function seenRequest($id)
    {
        if (!$id) {
            return response()->json([
                'type' => 'error',
                'text' => 'No ID provided.',
            ], 400);
        }

        $selectedReq = StatusRequest::where('requestId', $id)->first();

        if (!$selectedReq) {
            return response()->json([
                'type' => 'error',
                'text' => "Request with ID {$id} not found.",
            ], 404);
        }

        $selectedReq->update(['seenStatus' => !$selectedReq->seenStatus, 'seenTime' => now()]);

        return response()->json([
            'type' => 'success',
            'text' => 'Request seen status updated.',
        ]);
    }
}
