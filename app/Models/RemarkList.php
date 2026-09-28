<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Daftar remark siap-pakai buat autocomplete di form SD/STBY/Note (lihat
// StatusRequestController::getRemarkList()/learnRemark()). `request_type` array
// (bukan string) karena 1 remark bisa berlaku buat lebih dari 1 tipe request
// (mis. remark yang sama dipakai baik pas SD maupun STBY) -- filter suggestion
// pakai whereJsonContains(). Baris baru otomatis ke-tambah tiap kali user ngetik
// remark yang belum ada di daftar (auto-learn), tidak perlu diisi manual semua.
class RemarkList extends Model
{
    protected $fillable = [
        'remark',
        'request_type',
    ];

    protected $casts = [
        'request_type' => 'array',
    ];
}
