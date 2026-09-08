<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk pengaturan/preferensi pengguna
class UserSetting extends Model
{
    // Relasi ke User pemilik setting ini
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Relasi ke unit/posisi yang terkait setting ini
    public function unitArea()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'user_id',
        'unit_position_id',
    ];
}
