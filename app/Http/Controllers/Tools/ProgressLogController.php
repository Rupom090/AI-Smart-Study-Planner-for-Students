<?php

namespace App\Http\Controllers\Tools;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProgressLog\StoreProgressLogRequest;
use App\Models\ProgressLog;
use Illuminate\Support\Facades\Auth;

class ProgressLogController extends Controller
{
    public function store(StoreProgressLogRequest $request)
    {
        $user = $request->user() ?? Auth::user();
        $log = ProgressLog::create(array_merge($request->validated(), ['user_id' => $user->id]));
        return response()->json($log, 201);
    }
}
