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
    public $incrementing = false; // primary key bukan angka auto increment
    protected $keyType = 'string'; // tipe primary key berupa string
    protected $primaryKey = 'user_id';

    // Auto generate user_id saat user baru dibuat
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->user_id)) {
                $lastId = User::orderBy('user_id', 'desc')->first()?->user_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                // Format id jadi USR001, USR002, dst
                $model->user_id = 'USR' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'whatsAppNum'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    // Kolom yang disembunyikan saat serialisasi (data sensitif)
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
            'password' => 'hashed', // password otomatis di-hash
        ];
    }
    // Relasi ke Role/jabatan user ini
    public function roleData()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    // Relasi many-to-many ke UnitPosition lewat tabel pivot user_settings
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
