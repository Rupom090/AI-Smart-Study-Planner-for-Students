<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Http\Requests\Plan\GeneratePlanRequest;
use App\Http\Requests\Plan\RegeneratePlanRequest;
use App\Http\Resources\DailyPlanResource;
use App\Models\DailyPlan;
use App\Services\StudyPlanGenerator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PlanController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $plan = DailyPlan::with('tasks.topic')
            ->where('user_id', $user->id)
            ->whereDate('plan_date', Carbon::today($user->timezone ?? 'UTC'))
            ->first();

        if ($plan) {
            $this->authorize('view', $plan);
            return response()->json(new DailyPlanResource($plan));
        }

        return response()->json(null);
    }

    public function generate(GeneratePlanRequest $request, StudyPlanGenerator $generator): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        
        $this->authorize('create', DailyPlan::class);
        
        $planDate = $request->filled('regenerate_for_date')
            ? Carbon::parse($request->validated('regenerate_for_date'))
            : Carbon::today($user->timezone ?? 'UTC');

        $plan = $generator->generatePlanForUser($user, $planDate, $request->validated('available_minutes'));
        
        return response()->json(new DailyPlanResource($plan), 201);
    }

    public function regenerate(RegeneratePlanRequest $request, StudyPlanGenerator $generator): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        
        $planDate = Carbon::parse($request->validated('plan_date'));
        $existingPlan = DailyPlan::where('user_id', $user->id)
            ->whereDate('plan_date', $planDate)
            ->first();
        
        if ($existingPlan) {
            $this->authorize('regenerate', $existingPlan);
        }

        $plan = $generator->regeneratePlanForUser($user, $planDate, $request->validated('available_minutes'));
        
        return response()->json(new DailyPlanResource($plan));
    }
}
