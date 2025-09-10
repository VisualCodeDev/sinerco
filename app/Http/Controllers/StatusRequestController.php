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

        $start = Carbon::parse($val['start_time']);
        if ($start->minute > 0) {
            $start->addHour()->minute(0)->second(0);
        } else {
            $start->minute(0)->second(0);
        }
        $formatted = $start->format('H:i');

        $unit = DailyReport::whereRelation('unitPosition', 'unit_id', $val['unit_id'])
            ->where('date', $val['start_date'])
            ->where('time', $formatted)
            ->first();

        $unitPosition = UnitPosition::with('unit')->find($val['unit_position_id']);

        // if (!$unit) {
        //     return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        // }

        $user = auth()->user();
        $status = new StatusRequest();
        $status->unit_position_id = $val['unit_position_id'];
        $status->start_date = $val['start_date'];
        $status->start_time = $val['start_time'];
        $status->request_type = $val['request_type'];
        $status->remarks = $val['remarks'];
        $status->status = 'Ongoing';
        $status->requested_by = $user->user_id;
        // $status->location_id = $val['location_id'];

        $unitPosition->unit->update(['status' => $val['request_type']]);
        if ($unit) {
            $unit->update(['request_id' => $status->request_id]);

            $unit->load(['request', 'unitPosition.unit']);
            if ($unit->request && $unit->unit_position && $unit->unit_position->unit) {
                $unit->unit_position->unit->update([
                    'status' => $unit->request->request_type
                ]);
            }
            // return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        }
        $status->save();

        try {
            $technicians = UserSetting::with(['user', 'unitArea'])
                ->whereHas('unitArea', function ($query) use ($val) {
                    $query->where('unit_id', $val['unit_id']);
                })
                ->get();

            $unitData = $unitPosition->unit;
            $numbers = $technicians
                ->filter(fn($tech) => !empty($tech->user->whatsAppNum))
                ->map(fn($tech) => $tech->user->whatsAppNum)
                ->implode(',');

            if (!empty($numbers)) {
                $link = route('request.seen', ['id' => $status->request_id]);

                WhatsAppService::sendMessage($numbers, "TEST: A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['start_date']}\nStart Time: {$val['start_time']}\nRequest Type: {$val['request_type']}\nRemarks: {$val['remarks']}\n\nConfirm here: {$link}");
            }
            $link = 'https://vncdev-sinerco.my.id/unit-setting';
            WhatsAppService::sendMessage('082113837546', "A new request has been created for unit: {$unitData->unit}.\nStart Date: {$val['start_date']}\nStart Time: {$val['start_time']}\nRequest Type: {$val['request_type']}\nRemarks: {$val['remarks']}\n\nConfirm here:\n{$link}\n");

            return response()->json(['type' => 'success', 'text' => 'Request created successfully.'], 201);
        } catch (\Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    public function getRequest()
    {
        $permissionData = DataUnitController::getPermittedUnit();

        $unit_ids = collect($permissionData)->pluck('unit_position_id')->unique()->filter();

        $requestList = StatusRequest::whereIn('unit_position_id', $unit_ids)->with('unitPosition', 'user', 'pic')->get();
        $requestList = collect($requestList)
            ->values();
        // ->toArray();

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
                'seen_status' => $req->seen_status === 1 ? true : false,
                'start_date' => $req->start_date,
                'start_time' => $req->start_time,
                'status' => $req->status,
                'unit' => $req->unitPosition->unit->unit,
                'area' => $req->unitPosition->location->area->area,
                'location' => $req->unitPosition->location->location,
            ];
        });
        return Inertia::render('Request/Request', ['data' => $data]);
    }

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

    public function updateRequest(Request $request)
    {
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
        //     $unit = DailyReport::whereRelation('unit_position', 'unit_position_id', $val['unit_position_id'])->where('date', $start_date)->where('time', $formatted)->first();
        //     if (!$unit) {
        //         return response()->json(['type' => 'error', 'text' => 'Daily Report Unit Time not Found'], 500);
        //     }
        // }

        $status = StatusRequest::with('unitPosition.unit')->where('request_id', $request->request_id)->first();

        if (!$status) {
            return back()->with('status', 'Request not found.');
        }
        $currStatus = $status->status;
        // Update status and end time
        if ($currStatus === "End") {
            $status->status = "Ongoing";
        }
        ;
        if ($currStatus === "Ongoing") {
            $status->status = "End";
        }
        ;
        $status->end_time = $request->end_time ?? null;
        $status->end_date = $request->end_date ?? null;
        $status->remarks = $request->remarks ?? $status->remarks;

        // Handle unit status updates if the relationship is loaded
        $unitData = $status->unitPosition->unit;
        if ($unitData) {
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

    public function moveToHistory(Request $request)
    {
        $ids = $request->ids; // array of selected request IDs

        if (!$ids || !is_array($ids)) {
            return response()->json(['message' => 'No requests selected'], 400);
        }

        $requests = StatusRequest::whereIn('request_id', $ids)->get();

        foreach ($requests as $req) {
            // Ensure requested_by exists in users table
            $requestedBy = \DB::table('users')->where('user_id', $req->requested_by)->exists()
                ? $req->requested_by
                : null; // or some default user ID

            // Insert into history table
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
            $req->delete();
        }

        return response()->json(['type' => 'success', 'text' => 'Request trashed!']);
    }

}
