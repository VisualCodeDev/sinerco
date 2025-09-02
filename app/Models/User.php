<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'user_id';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->user_id)) {
                $lastId = User::orderBy('user_id', 'desc')->first()?->user_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                $model->user_id = 'USR' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function roleData()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    public function UnitPositions()
    {
        return $this->belongsToMany(
            UnitPosition::class,
            'user_settings',         // Pivot table
            'user_id',                   // foreign key on pivot to User
            'unit_position_id',       // foreign key on pivot to UnitPosition
            'user_id',                       // local key on User (primary key)
            'id'        // local key on UnitPosition
        );
    }
}
