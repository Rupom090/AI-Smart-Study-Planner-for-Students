<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProgressLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'log_date',
        'minutes_studied',
        'completion_status',
    ];

    protected $casts = [
        'log_date' => 'date',
        'minutes_studied' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (ProgressLog $log) {
            if (! $log->getKey()) {
                $log->{$log->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
}
