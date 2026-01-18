<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    $subjects = \App\Models\Subject::where('user_id', $user->id)
        ->withCount('topics')
        ->with('topics')
        ->get();
    
    $todaysPlan = \App\Models\DailyPlan::with('tasks.topic.subject')
        ->where('user_id', $user->id)
        ->whereDate('plan_date', today())
        ->first();

    $stats = [
        'totalSubjects' => $subjects->count(),
        'totalTopics' => \App\Models\Topic::whereHas('subject', fn($q) => $q->where('user_id', $user->id))->count(),
        'completedTopics' => \App\Models\Topic::whereHas('subject', fn($q) => $q->where('user_id', $user->id))->where('is_completed', true)->count(),
        'todayTasksCompleted' => $todaysPlan ? $todaysPlan->tasks->where('status', 'completed')->count() : 0,
        'todayTasksTotal' => $todaysPlan ? $todaysPlan->tasks->count() : 0,
    ];

    return Inertia::render('Dashboard', [
        'subjects' => $subjects,
        'todaysPlan' => $todaysPlan,
        'stats' => $stats,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/subjects', function () {
        $subjects = \App\Models\Subject::where('user_id', auth()->id())
            ->with('topics')
            ->get();
        return Inertia::render('Subjects', ['subjects' => $subjects]);
    })->name('subjects');

    Route::get('/study-plan', function () {
        $plan = \App\Models\DailyPlan::with('tasks.topic.subject')
            ->where('user_id', auth()->id())
            ->whereDate('plan_date', today())
            ->first();
        return Inertia::render('StudyPlan', ['plan' => $plan]);
    })->name('study-plan');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
