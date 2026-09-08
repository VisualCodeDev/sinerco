<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    // kolom yang boleh diisi mass-assignment
    protected $fillable = ['name'];

    // relasi ke banyak Area dalam region ini
    public function areas()
    {
        return $this->hasMany(Area::class);
    }
}
