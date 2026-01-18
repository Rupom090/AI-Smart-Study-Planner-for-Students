<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\DailyTask;

class TaskController extends Controller
{
    public function updateStatus(UpdateTaskStatusRequest $request, DailyTask $task)
    {
        $task->update(['status' => $request->validated('status')]);
        return response()->json($task);
    }
}
