<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableCell extends Model
{
    use HasFactory;

    protected $fillable = [
        'daily_report_id',
        'parameter',
        'value',
        'unit',
        'min_range',
        'max_range',
    ];

    // Relasi ke DailyReport
    public function report()
    {
        return $this->belongsTo(DailyReport::class, 'daily_report_id');
    }
}
