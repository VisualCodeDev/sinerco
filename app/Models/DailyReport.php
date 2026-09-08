<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    protected static function boot()
    {
        parent::boot();

        // saat membuat report baru dari sebuah request, samakan tanggal & jam dengan request-nya
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

            // bulatkan ke jam penuh jika ada menit
            if ($datetime->minute > 0) {
                $datetime->addHour()->startOfHour();
            }

            $dailyReport->date = $datetime->toDateString();
            $dailyReport->time = $datetime->format('H:i');
        });
    }
    // relasi ke UnitPosition pemilik report ini
    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
    // relasi ke StatusRequest terkait report ini
    public function request()
    {
        return $this->belongsTo(StatusRequest::class, 'request_id', 'request_id');
    }
    // cast kolom data menjadi array
    protected $casts = [
        'data' => 'array',
    ];

    // kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'unit_position_id',
        'data',
        'date',
        'time',
        'request_id',
    ];
}
