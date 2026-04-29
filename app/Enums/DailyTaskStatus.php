<?php

namespace App\Enums;

enum DailyTaskStatus: string
{
    case NOT_STARTED = 'not_started';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case SKIPPED = 'skipped';

    public function label(): string
    {
        return match($this) {
            self::NOT_STARTED => 'Not Started',
            self::IN_PROGRESS => 'In Progress',
            self::COMPLETED => 'Completed',
            self::SKIPPED => 'Skipped',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::NOT_STARTED => 'slate',
            self::IN_PROGRESS => 'blue',
            self::COMPLETED => 'green',
            self::SKIPPED => 'gray',
        };
    }
}
