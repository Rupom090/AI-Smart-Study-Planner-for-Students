<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Topic extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'subject_id',
        'user_id',
        'title',
        'difficulty',
        'estimated_hours',
        'is_completed',
        'notes',
    ];

    public $searchable = ['title'];
    public $filterable = ['difficulty', 'is_completed'];
    public $sortable = ['title', 'difficulty', 'estimated_hours', 'created_at'];

    protected $casts = [
        'is_completed'    => 'boolean',
        'estimated_hours' => 'float',
        'difficulty'      => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Topic $topic) {
            if (!$topic->getKey()) {
                $topic->{$topic->getKeyName()} = (string) Str::uuid();
            }
            // Propagate user_id from parent subject for efficient querying
            if (!$topic->user_id && $topic->subject_id) {
                $subject = Subject::find($topic->subject_id);
                if ($subject) {
                    $topic->user_id = $subject->user_id;
                }
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
