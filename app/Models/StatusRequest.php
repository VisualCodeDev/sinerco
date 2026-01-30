<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Str;

class StatusRequest extends Model
{
    //
    public $primaryKey = 'request_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->request_id = (string) Str::uuid();
        });

        static::creating(function ($status) {
            if (!$status->start_date || !$status->start_time) {
                return;
            }

            $dt = Carbon::createFromFormat(
                'Y-m-d H:i',
                $status->start_date . ' ' . $status->start_time
            );

            // buletin ke HH:00
            if ($dt->minute > 0) {
                $dt->addHour()->startOfHour();
            }

            $exists = DailyReport::where('unit_position_id', $status->unit_position_id)
                ->where('date', $dt->toDateString())
                ->where('time', $dt->format('H:i'))
                ->whereNotNull('request_id')
                ->exists();

            if ($exists) {
                throw new \Exception('A request already exists for this time.');
                // atau ValidationException biar cakep
            }

            // baru generate request_id
            $status->request_id = (string) Str::uuid();
        });


        static::created(function ($statusRequest) {
            AdminNotification::create([
                'request_id' => $statusRequest->request_id,
                'date' => $statusRequest->start_date,
                'time' => $statusRequest->start_time,
                'request_type' => $statusRequest->request_type,
                'status' => $statusRequest->status,
            ]);
        });

        static::saving(function ($status) {
            if (!$status->start_date || !$status->start_time)
                return;

            // hitung jam baru
            $newDt = Carbon::createFromFormat(
                'Y-m-d H:i',
                $status->start_date . ' ' . $status->start_time
            );

            if ($newDt->minute > 0) {
                $newDt->addHour()->startOfHour();
            }

            $report = DailyReport::where('unit_position_id', $status->unit_position_id)
                ->where('date', $newDt->toDateString())
                ->where('time', $newDt->format('H:i'))
                ->first();

            if ($report && $report->request_id !== $status->request_id) {
                throw new \Exception('Time slot already used by another request.');
            }

            // ambil jam lama (kalau update)
            $old = $status->getOriginal();

            if (!empty($old['start_date']) && !empty($old['start_time'])) {
                $oldDt = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $old['start_date'] . ' ' . $old['start_time']
                );

                if ($oldDt->minute > 0) {
                    $oldDt->addHour()->startOfHour();
                }

                DailyReport::where('unit_position_id', $status->unit_position_id)
                    ->where('date', $oldDt->toDateString())
                    ->where('time', $oldDt->format('H:i'))
                    ->where('request_id', $status->request_id)
                    ->update(['request_id' => null]);
            }

            DailyReport::updateOrCreate(
                [
                    'unit_position_id' => $status->unit_position_id,
                    'date' => $newDt->toDateString(),
                    'time' => $newDt->format('H:i'),
                ],
                [
                    'request_id' => $status->request_id,
                    'data' => $existing?->data ?? [],
                ]
            );
        });

        static::saved(function ($status) {
            if (!$status->start_date || !$status->start_time)
                return;

            $dt = Carbon::createFromFormat(
                'Y-m-d H:i',
                $status->start_date . ' ' . $status->start_time
            );

            if ($dt->minute > 0) {
                $dt->addHour()->startOfHour();
            }

            DailyReport::updateOrCreate(
                [
                    'unit_position_id' => $status->unit_position_id,
                    'date' => $dt->toDateString(),
                    'time' => $dt->format('H:i'),
                ],
                [
                    'request_id' => $status->request_id,
                    'data' => []
                ]
            );
        });
    }

    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id')
            ->with('unit', 'location');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'requested_by', 'user_id')
            ->select('user_id', 'name');

    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'seen_by', 'user_id')
            ->select('user_id', 'name');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    protected $fillable = [
        'date',
        'request_type',
        'time_start',
        'status',
        'request_id',
        'time_end',
        'seen_status',
        'seen_time',
        'seen_by',
        'unit_position_id'
    ];
}
