<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProgressLog\UpdateTaskStatusRequest;
use App\Models\DailyTask;

class TaskController extends Controller
{
    public function updateStatus(UpdateTaskStatusRequest $request, DailyTask $task)
    {
        $task->update(['status' => $request->validated('status')]);
        return response()->json($task);
    }
}
