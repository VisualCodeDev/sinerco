<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\DailyReport;
use App\Models\DataUnit;
use App\Models\StatusRequest;
use App\Models\UnitAreaLocation;
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

        $start = Carbon::parse($val['startTime']);
        if ($start->minute > 0) {
            $start->addHour()->minute(0)->second(0);
        } else {
            $start->minute(0)->second(0);
        }
        $formatted = $start->format('H:i');

        $unit = DailyReport::whereRelation('unitAreaLocation', 'unitId', $val['unitId'])
            ->where('date', $val['startDate'])
            ->where('time', $formatted)
            ->first();

        $unitAreaLocation = UnitAreaLocation::where('unitId', $val['unitId'])->where('locationId', $val['locationId'])->first();

        // if (!$unit) {
        //     return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        // }

        $user = auth()->user();
        $status = new StatusRequest();
        $status->unitAreaLocationId = $unitAreaLocation->unitAreaLocationId;
        $status->startDate = $val['startDate'];
        $status->startTime = $val['startTime'];
        $status->requestType = $val['requestType'];
        $status->remarks = $val['remarks'];
        $status->status = 'Ongoing';
        $status->requestedBy = $user->id;
        // $status->locationId = $val['locationId'];
        $status->save();

        if ($unit) {
            $unit->update(['requestId' => $status->requestId]);

            $unit->load(['request', 'unitAreaLocation.unit']);
            if ($unit->request && $unit->unitAreaLocation && $unit->unitAreaLocation->unit) {
                $unit->unitAreaLocation->unit->update([
                    'status' => $unit->request->requestType
                ]);
            }
            // return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        }

        try {
            $technicians = UserSetting::with(['user', 'unitArea'])
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

        $unitIds = collect($permissionData)->pluck('unitAreaLocationId')->unique()->filter();

        $requestList = StatusRequest::whereIn('unitAreaLocationId', $unitIds)->with('unitAreaLocation', 'user', 'pic')->get();
        $requestList = collect($requestList)
            ->values()
            ->toArray();
        ;

        return Inertia::render('Request/Request', ['data' => $requestList]);
    }

    public function getRequestedUnit()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unitIds = collect($permissionData)->pluck('unitAreaLocationId')->unique()->filter();

        $requestList = StatusRequest::whereIn('unitAreaLocationId', $unitIds)->with('unitAreaLocation', 'user', 'location.area', 'pic')->get();
        $requestList = collect($requestList)
            ->values()
            ->toArray();
        return response()->json($requestList);
    }

    public function updateRequest(Request $request)
    {
        $val = $request->validate([
            'unitAreaLocationId' => 'required|string',
            'startDate' => 'nullable|string',
            'startTime' => 'nullable|string',
            'requestId' => 'required|string',
            'status' => 'required|string',
            'endTime' => 'nullable|string',
            'endDate' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);
        $status = StatusRequest::with('unitAreaLocation')->where('requestId', $request->requestId)->first();

        if ($val['startTime'] || $val['startDate']) {
            $startTime = $val['startTime'] ?? $status->startTime;
            $startDate = $val['startDate'] ?? $status->startDate;

            $start = Carbon::parse($startTime);
            if ($start->minute > 0) {
                $start->addHour()->minute(0)->second(0);
            } else {
                $start->minute(0)->second(0);
            }
            $formatted = $start->format('H:i');
            $unit = DailyReport::whereRelation('unitAreaLocation', 'unitAreaLocationId', $val['unitAreaLocationId'])->where('date', $startDate)->where('time', $formatted)->first();
            if (!$unit) {
                return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
            }
        }


        if (!$status) {
            return back()->with('status', 'Request not found.');
        }

        // Update status and end time
        $status->status = $request->status;
        $status->endTime = $request->endTime ?? null;
        $status->endDate = $request->endDate ?? null;
        $status->remarks = $request->remarks ?? $status->remarks;

        // Handle unit status updates if the relationship is loaded
        if ($status->unit) {
            $newUnitStatus = match ($status->status) {
                'Ongoing' => $status->requestType,
                'End' => 'running',
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
        if (!$user && !$user->id) {
            return response()->json([
                'type' => 'error',
                'text' => 'User Not Found',
            ], 400);
        }
        if ($user->roleData?->name != 'technician') {
            return response()->json([
                'type' => 'error',
                'text' => 'Unauthorized',
            ], 400);
        }
        $selectedReq = StatusRequest::where('requestId', $id)->first();

        if (!$selectedReq) {
            return response()->json([
                'type' => 'error',
                'text' => "Request with ID {$id} not found.",
            ], 404);
        }
        if ($selectedReq->seenStatus) {
            $selectedReq->update(['seenStatus' => !$selectedReq->seenStatus, 'seenTime' => null, 'seenBy' => null]);
        } else {
            $selectedReq->update(['seenStatus' => !$selectedReq->seenStatus, 'seenTime' => now(), 'seenBy' => $user->id]);
        }
        return response()->json([
            'type' => 'success',
            'text' => 'Request seen status updated.',
        ]);
    }
}
