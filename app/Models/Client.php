<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'clientId',
        'name',
        'input_interval',
        'input_duration',
    ];
}
