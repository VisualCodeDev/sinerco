<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Tingkat teratas hierarki lokasi (Region -> Area -> Location). Beda dengan
// area/location, region_id DISIMPAN LANGSUNG di unit_positions (bukan
// diturunkan dari relasi lain).
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
