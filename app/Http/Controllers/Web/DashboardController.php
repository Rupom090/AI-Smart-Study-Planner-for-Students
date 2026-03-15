<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\DailyPlan;
use App\Models\DailyTask;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Topic;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = Carbon::today($user->timezone ?? 'UTC');

        // 1. Basic Data
        $subjects = Subject::where('user_id', $user->id)->get();

        // 2. Today's Plan & Focus
        $todaysPlan = DailyPlan::with([
            'tasks' => function ($q) {
                $q->orderBy('task_order');
            },
            'tasks.topic.subject'
        ])
            ->where('user_id', $user->id)
            ->whereDate('plan_date', $today)
            ->first();

        // 3. Weekly Focus Score (Completion rate of last 7 days)
        $last7DaysPlans = DailyPlan::with('tasks')
            ->where('user_id', $user->id)
            ->whereBetween('plan_date', [$today->copy()->subDays(6), $today])
            ->get();

        $totalTasksLastWeek = 0;
        $completedTasksLastWeek = 0;
        $studyMinutesLastWeek = 0;

        foreach ($last7DaysPlans as $p) {
            $totalTasksLastWeek += $p->tasks->count();
            $completedTasksLastWeek += $p->tasks->where('status', 'completed')->count();
            // Estimate study time based on completed tasks (rough approx using planned minutes if available, else standard)
            // For now, let's just use total_hours from plan if available, or sum task minutes
            $studyMinutesLastWeek += $p->tasks->where('status', 'completed')->sum('planned_minutes') ?? 0;
        }

        $weeklyFocusScore = $totalTasksLastWeek > 0
            ? round(($completedTasksLastWeek / $totalTasksLastWeek) * 100)
            : 0;

        // 4. Strongest/Weakest Subject
        // Based on topic completion status or just a random heuristic if no data yet
        // A better metric: Subject with most completed topics vs total topics
        $subjectStats = $subjects->map(function ($subject) {
            $totalTopics = $subject->topics()->count();
            $completedTopics = $subject->topics()->where('is_completed', true)->count();
            $ratio = $totalTopics > 0 ? $completedTopics / $totalTopics : 0;
            return [
                'name' => $subject->name,
                'ratio' => $ratio,
                'total' => $totalTopics
            ];
        });

        $strongest = $subjectStats->sortByDesc('ratio')->first();
        $weakest = $subjectStats->sortBy('ratio')->first();

        // 5. Next Exam
        $nextExam = Subject::where('user_id', $user->id)
            ->where('exam_date', '>=', $today)
            ->orderBy('exam_date', 'asc')
            ->first();

        // 6. Narrative Progress (Simple Logic)
        $progressStory = [];
        if ($weeklyFocusScore > 75) {
            $progressStory[] = "You're on fire! " . $weeklyFocusScore . "% consistency this week.";
        } elseif ($weeklyFocusScore > 40) {
            $progressStory[] = "Steady progress. " . $weeklyFocusScore . "% consistency. Push a bit harder!";
        } else {
            $progressStory[] = "Rough week? Only " . $weeklyFocusScore . "% consistency. Let's reset today.";
        }

        if ($nextExam) {
            $days = Carbon::parse($nextExam->exam_date)->diffInDays($today);
            if ($days <= 3)
                $progressStory[] = "Crunch time! " . $nextExam->name . " is in " . $days . " days.";
        }

        // 7. Weekly activity chart data (last 7 days)
        $weeklyActivity = collect(range(6, 0))->map(function ($daysAgo) use ($user) {
            $date = Carbon::today($user->timezone ?? 'UTC')->subDays($daysAgo);
            return [
                'name'      => $date->format('D'),
                'materials' => StudyMaterial::where('user_id', $user->id)
                    ->whereDate('created_at', $date)->count(),
                'topics'    => Topic::where('user_id', $user->id)
                    ->whereDate('updated_at', $date)
                    ->where('is_completed', true)->count(),
            ];
        })->values()->toArray();

        return Inertia::render('Dashboard', [
            'subjects'       => $subjects,
            'todaysPlan'     => $todaysPlan,
            'progressStory'  => $progressStory,
            'weeklyActivity' => $weeklyActivity,
            // Stats for the dashboard cards
            'stats' => [
                'tasks_completed' => $completedTasksLastWeek,
                'tasks_total'     => $totalTasksLastWeek,
                'hours_studied'   => round($studyMinutesLastWeek / 60, 1),
            ],
            // Keep intelligence data for any future widgets
            'intelligence' => [
                'weeklyFocusScore'    => $weeklyFocusScore,
                'strongestSubject'    => $strongest['name'] ?? 'N/A',
                'weakestSubject'      => $weakest['name'] ?? 'N/A',
                'nextExam'            => $nextExam ? [
                    'name'     => $nextExam->name,
                    'daysLeft' => Carbon::parse($nextExam->exam_date)->diffInDays($today),
                    'date'     => $nextExam->exam_date->format('M d'),
                ] : null,
            ],
        ]);
    }
}
