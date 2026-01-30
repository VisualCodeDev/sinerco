<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($dailyReport) {
            if (!$dailyReport->request_id)
                return;
            
            static::creating(function ($report) {
                if (empty($report->data)) {
                    $report->data = [];
                }
            });

            $request = StatusRequest::where(
                'request_id',
                $dailyReport->request_id
            )->first();

            if (!$request || !$request->time_start)
                return;

            $datetime = Carbon::createFromFormat(
                'Y-m-d H:i',
                $request->date . ' ' . $request->time_start
            );

            if ($datetime->minute > 0) {
                $datetime->addHour()->startOfHour();
            }

            $dailyReport->date = $datetime->toDateString();
            $dailyReport->time = $datetime->format('H:i');
        });
    }
    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
    public function request()
    {
        return $this->belongsTo(StatusRequest::class, 'request_id', 'request_id');
    }
    protected $casts = [
        'data' => 'array',
    ];

    protected $fillable = [
        'unit_position_id',
        'data',
        'date',
        'time',
        'request_id',
    ];
}
