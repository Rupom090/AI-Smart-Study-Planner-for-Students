<?php

namespace App\Http\Controllers;

use App\Http\Requests\GeneratePlanRequest;
use App\Http\Requests\RegeneratePlanRequest;
use App\Models\DailyPlan;
use App\Services\StudyPlanGenerator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlanController extends Controller
{
    public function today(Request $request)
    {
        $user = $request->user() ?? Auth::user();
        $plan = DailyPlan::with('tasks.topic')
            ->where('user_id', $user->id)
            ->whereDate('plan_date', Carbon::today($user->timezone ?? 'UTC'))
            ->first();

        return response()->json($plan);
    }

    public function generate(GeneratePlanRequest $request, StudyPlanGenerator $generator)
    {
        $user = $request->user() ?? Auth::user();
        $planDate = $request->filled('regenerate_for_date')
            ? Carbon::parse($request->validated('regenerate_for_date'))
            : Carbon::today($user->timezone ?? 'UTC');

        $plan = $generator->generatePlanForUser($user, $planDate, $request->validated('available_minutes'));
        return response()->json($plan, 201);
    }

    public function regenerate(RegeneratePlanRequest $request, StudyPlanGenerator $generator)
    {
        $user = $request->user() ?? Auth::user();
        $planDate = Carbon::parse($request->validated('plan_date'));

        $plan = $generator->regeneratePlanForUser($user, $planDate, $request->validated('available_minutes'));
        return response()->json($plan);
    }
}
