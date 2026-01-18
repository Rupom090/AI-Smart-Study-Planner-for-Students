<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DailyPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_date',
        'total_hours',
        'ai_version',
    ];

    protected $casts = [
        'plan_date' => 'date',
        'total_hours' => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (DailyPlan $plan) {
            if (! $plan->getKey()) {
                $plan->{$plan->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(DailyTask::class);
    }
}
