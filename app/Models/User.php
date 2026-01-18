<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'timezone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (! $user->getKey()) {
                $user->{$user->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function dailyPlans()
    {
        return $this->hasMany(DailyPlan::class);
    }

    public function progressLogs()
    {
        return $this->hasMany(ProgressLog::class);
    }

    public function aiFeedback()
    {
        return $this->hasMany(AiFeedback::class);
    }
}
