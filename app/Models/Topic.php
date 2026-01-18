<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'difficulty',
        'estimated_hours',
        'is_completed',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'estimated_hours' => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (Topic $topic) {
            if (! $topic->getKey()) {
                $topic->{$topic->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function progressLogs()
    {
        return $this->hasMany(ProgressLog::class);
    }

    public function dailyTasks()
    {
        return $this->hasMany(DailyTask::class);
    }
}
