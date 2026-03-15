<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

class CacheService
{
    public const SUBJECT_CACHE_TTL = 3600; // 1 hour
    public const TOPIC_CACHE_TTL = 3600;  // 1 hour
    public const PLAN_CACHE_TTL = 600;    // 10 minutes
    public const USER_CACHE_TTL = 1800;   // 30 minutes

    /**
     * Cache user subjects
     */
    public function getUserSubjects(string $userId): Collection
    {
        return Cache::remember(
            "user.{$userId}.subjects",
            self::SUBJECT_CACHE_TTL,
            function () use ($userId) {
                return \App\Models\Subject::where('user_id', $userId)
                    ->with('topics')
                    ->get();
            }
        );
    }

    /**
     * Cache subject topics
     */
    public function getSubjectTopics(string $subjectId): Collection
    {
        return Cache::remember(
            "subject.{$subjectId}.topics",
            self::TOPIC_CACHE_TTL,
            function () use ($subjectId) {
                return \App\Models\Topic::where('subject_id', $subjectId)->get();
            }
        );
    }

    /**
     * Cache user's today's plan
     */
    public function getUserTodayPlan(string $userId, string $timezone = 'UTC')
    {
        $today = \Carbon\Carbon::today($timezone)->toDateString();
        return Cache::remember(
            "user.{$userId}.plan.{$today}",
            self::PLAN_CACHE_TTL,
            function () use ($userId, $today) {
                return \App\Models\DailyPlan::with('tasks.topic')
                    ->where('user_id', $userId)
                    ->whereDate('plan_date', $today)
                    ->first();
            }
        );
    }

    /**
     * Invalidate user subjects cache
     */
    public function invalidateUserSubjects(string $userId): void
    {
        Cache::forget("user.{$userId}.subjects");
    }

    /**
     * Invalidate subject topics cache
     */
    public function invalidateSubjectTopics(string $subjectId): void
    {
        Cache::forget("subject.{$subjectId}.topics");
    }

    /**
     * Invalidate user's daily plans cache
     */
    public function invalidateUserPlans(string $userId): void
    {
        Cache::flush();
    }
}
