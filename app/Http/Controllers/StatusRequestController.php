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
    public function index()
    {
        return Inertia::render('Request');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function setRequest(Request $request)
    {
        $val = $request->validate([
            'date' => 'required|string',
            'time' => 'required|string',
            'requestType' => 'required|string',
        ]);

        try {
            $status = new StatusRequest();
            $status->date = $val['date'];
            $status->timeStart = $val['time'];
            $status->requestType = $val['requestType'];
            $status->status = 'Pending';
            $isComplete = $status->save();
            // if ($isComplete) {
            //     $notification = new AdminNotification();
            //     $notification->requestId = $status->requestId;
            //     $notification->date = $status->date;
            //     $notification->time = $status->timeStart;
            //     $notification->requestType = $status->requestType;
            //     $notification->status = $status->status;
            //     $notification->save();
            // }

            $message = [
                'date' => $val['date'],
                'time' => $val['time'],
                'requestType' => $val['requestType'],
                'status' => 'Pending',
                'id' => $status->requestId,
            ];

            session()->push('message', $message);
            // session()->forget('message');
            return redirect('/request');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getRequest()
    {
        $status = StatusRequest::all();
        return Inertia::render('Welcome', ['data' => $status]);
    }

    public function updateRequest(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'status' => 'required|string',
            'timeEnd' => 'nullable|string',
        ]);
        $status = StatusRequest::where('requestId', $request->id)->first();
        if ($status) {
            $status->status = $request->status;
            $status->timeEnd = $request->timeEnd;
            $status->save();

            if ($status->status === "Done") {
                $notification = AdminNotification::where('requestId', $request->id)->first();
                $notification->status = $request->status;
                $notification->save();
                
                $messages = session('message');
                if (is_array($messages)) {
                    $filteredMessages = array_filter($messages, function ($msg) use ($request) {
                        return $msg['id'] !== $request->id;
                    });
                    session(['message' => array_values($filteredMessages)]);
                }
            }
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
