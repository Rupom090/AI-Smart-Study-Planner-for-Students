<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DailyTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'daily_plan_id',
        'topic_id',
        'task_title',
        'planned_minutes',
        'task_order',
        'status',
    ];

    protected $casts = [
        'planned_minutes' => 'integer',
        'task_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (DailyTask $task) {
            if (! $task->getKey()) {
                $task->{$task->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function plan()
    {
        return $this->belongsTo(DailyPlan::class, 'daily_plan_id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
}
