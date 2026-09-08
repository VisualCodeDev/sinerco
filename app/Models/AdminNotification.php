<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk notifikasi admin
class AdminNotification extends Model
{
    //
    // Relasi ke banyak StatusRequest berdasarkan request_id
    public function Request()
    {
        return $this->hasMany(StatusRequest::class, 'request_id', 'request_id');
    }
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'date',
        'time',
        'request_type',
        'status',
        'request_id',
    ];
}
