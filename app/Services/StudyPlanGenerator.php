<?php

namespace App\Services;

use App\Models\AiFeedback;
use App\Models\DailyPlan;
use App\Models\DailyTask;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use OpenAI; // requires composer package openai-php/client

class StudyPlanGenerator
{
    /**
     * Build or rebuild the plan for the given date.
     */
    public function generatePlanForUser($user, Carbon $planDate, int $availableMinutes)
    {
        $subjects = Subject::with('topics')->where('user_id', $user->id)->get();
        $payload = $this->buildPromptPayload($subjects, $planDate, $availableMinutes);

        $useAi = filled(config('services.openai.key'));
        $content = '{}';
        $aiSummary = '';
        $tasks = [];
        $aiModel = null;

        if ($useAi) {
            try {
                $client = OpenAI::client(config('services.openai.key'));
                $response = $client->chat()->create([
                    'model' => config('services.openai.model', 'gpt-4o'),
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a study planner AI. Create realistic daily plans. Avoid overload. Output JSON with fields tasks (array) and summary (string).'],
                        ['role' => 'user', 'content' => json_encode($payload)],
                    ],
                    'response_format' => ['type' => 'json_object'],
                ]);

                $aiModel = $response->model ?? null;
                $content = $response->choices[0]->message->content ?? '{}';
                $parsed = json_decode($content, true);
                $tasks = Arr::get($parsed, 'tasks', []);
                $aiSummary = Arr::get($parsed, 'summary', '');
            } catch (\Throwable $e) {
                Log::warning('AI generation failed, falling back to heuristic plan', ['error' => $e->getMessage()]);
                $tasks = $this->fallbackTasks($subjects, $availableMinutes);
                $aiSummary = 'Fallback plan used due to AI error.';
            }
        } else {
            $tasks = $this->fallbackTasks($subjects, $availableMinutes);
            $aiSummary = 'Fallback plan used because OPENAI_API_KEY is not set.';
        }

        $plan = DB::transaction(function () use ($user, $planDate, $availableMinutes, $tasks, $aiSummary, $payload, $aiModel, $content) {
            $plan = DailyPlan::updateOrCreate(
                ['user_id' => $user->id, 'plan_date' => $planDate->toDateString()],
                ['total_hours' => $availableMinutes / 60, 'ai_version' => $aiModel]
            );

            $plan->tasks()->delete();
            foreach ($tasks as $index => $task) {
                DailyTask::create([
                    'daily_plan_id' => $plan->id,
                    'topic_id' => Arr::get($task, 'topic_id'),
                    'task_title' => Arr::get($task, 'title', 'Study'),
                    'planned_minutes' => Arr::get($task, 'minutes', null),
                    'task_order' => $index + 1,
                    'status' => 'pending',
                ]);
            }

            AiFeedback::create([
                'user_id' => $user->id,
                'plan_date' => $planDate->toDateString(),
                'input_summary' => json_encode($payload),
                'ai_response_summary' => $aiSummary ?: $content,
            ]);

            return $plan;
        });

        return $plan->load('tasks.topic');
    }

    public function regeneratePlanForUser($user, Carbon $planDate, int $availableMinutes)
    {
        // In a real flow you could mark previous tasks as skipped before regenerating.
        return $this->generatePlanForUser($user, $planDate, $availableMinutes);
    }

    private function buildPromptPayload($subjects, Carbon $planDate, int $availableMinutes): array
    {
        $payload = [
            'plan_date' => $planDate->toDateString(),
            'available_minutes' => $availableMinutes,
            'subjects' => [],
        ];

        foreach ($subjects as $subject) {
            $payload['subjects'][] = [
                'id' => $subject->id,
                'name' => $subject->name,
                'exam_date' => $subject->exam_date?->toDateString(),
                'priority_level' => $subject->priority_level,
                'topics' => $subject->topics->map(function ($topic) {
                    return [
                        'id' => $topic->id,
                        'title' => $topic->title,
                        'difficulty' => $topic->difficulty,
                        'estimated_hours' => $topic->estimated_hours,
                        'is_completed' => $topic->is_completed,
                    ];
                })->values()->all(),
            ];
        }

        // Add simple guidance to respect deadlines.
        $payload['rules'] = [
            'split syllabus into tasks',
            'prioritize urgent exams',
            'balance workload per day',
            'limit total minutes to available_minutes',
            'produce today tasks only with short titles and minute estimates',
        ];

        Log::info('AI plan payload', $payload);
        return $payload;
    }

    /**
     * Fallback heuristic tasks when AI is unavailable.
     */
    private function fallbackTasks($subjects, int $availableMinutes): array
    {
        $minutesLeft = $availableMinutes;
        $tasks = [];
        $sortedSubjects = $subjects->sortBy('exam_date');

        foreach ($sortedSubjects as $subject) {
            foreach ($subject->topics->where('is_completed', false) as $topic) {
                if ($minutesLeft <= 0) {
                    break 2;
                }

                $chunk = max(25, min(90, (int) round(($topic->estimated_hours ?? 1) * 60 / 2)));
                $minutes = min($chunk, $minutesLeft);
                $minutesLeft -= $minutes;

                $tasks[] = [
                    'topic_id' => $topic->id,
                    'title' => $subject->name . ': ' . $topic->title,
                    'minutes' => $minutes,
                ];
            }
        }

        return $tasks;
    }
}
