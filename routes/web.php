<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\StudyMaterialController;
use App\Http\Controllers\ChatController;
use App\Models\DailyTask;
use App\Services\StudyPlanGenerator;
use App\Http\Requests\GeneratePlanRequest;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/blog', function () {
    return Inertia::render('Blog/Index');
})->name('blog');

Route::get('/dashboard', function () {
    $user = auth()->user();

    // 1. Subjects (Active & Upcoming Exams)
    $subjects = \App\Models\Subject::where('user_id', $user->id)
        ->orderBy('exam_date', 'asc')
        ->get();

    // 2. Today's Plan (Full View)
    $todaysPlan = \App\Models\DailyPlan::where('user_id', $user->id)
        ->whereDate('plan_date', today())
        ->with([
            'tasks' => function ($q) {
                $q->orderBy('task_order', 'asc')->with('topic.subject');
            }
        ])
        ->first();

    // 3. Progress Snapshot
    $stats = [
        'tasks_completed' => $todaysPlan ? $todaysPlan->tasks->where('status', 'completed')->count() : 0,
        'tasks_total' => $todaysPlan ? $todaysPlan->tasks->count() : 0,
        'hours_studied' => $todaysPlan ? round($todaysPlan->tasks->where('status', 'completed')->sum('planned_minutes') / 60, 1) : 0,
    ];

    return Inertia::render('Dashboard', [
        'subjects' => $subjects,
        'todaysPlan' => $todaysPlan,
        'stats' => $stats
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/subjects', function () {
        $subjects = \App\Models\Subject::where('user_id', auth()->id())
            ->with('topics')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('Subjects', ['subjects' => $subjects]);
    })->name('subjects');

    Route::post('/subjects', function (Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'exam_date' => 'required|date',
            'priority_level' => 'required|integer|min:1|max:5',
        ]);

        \App\Models\Subject::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'exam_date' => $validated['exam_date'],
            'priority_level' => $validated['priority_level'],
        ]);

        return redirect()->back();
    })->name('subjects.store');

    Route::get('/study-plan', function () {
        $plan = \App\Models\DailyPlan::with('tasks.topic.subject')
            ->where('user_id', auth()->id())
            ->whereDate('plan_date', today())
            ->first();
        return Inertia::render('StudyPlan', ['plan' => $plan]);
    })->name('study-plan');

    Route::get('/focus', function () {
        return Inertia::render('FocusMode');
    })->name('focus');

    Route::get('/file-upload', function () {
        return Inertia::render('FileUploadPage');
    })->name('file-upload');

    Route::get('/components-demo', function () {
        return Inertia::render('ComponentsDemo');
    })->name('components-demo');

    Route::get('/subjects/{subject}/topics', function (\App\Models\Subject $subject) {
        if ($subject->user_id !== auth()->id()) {
            abort(403);
        }
        $subject->load([
            'topics' => function ($query) {
                $query->orderBy('is_completed', 'asc')->orderBy('created_at', 'desc');
            }
        ]);
        return Inertia::render('Topics', ['subject' => $subject]);
    })->name('subjects.topics');

    Route::post('/subjects/{subject}/topics', function (Request $request, \App\Models\Subject $subject) {
        if ($subject->user_id !== auth()->id()) {
            abort(403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|integer|min:1|max:5',
            'estimated_hours' => 'nullable|numeric|min:0.5|max:100',
        ]);

        $subject->topics()->create([
            'title' => $validated['title'],
            'difficulty' => $validated['difficulty'],
            'estimated_hours' => $validated['estimated_hours'],
            'is_completed' => false,
        ]);

        return redirect()->back();
    })->name('topics.store');

    Route::patch('/topics/{topic}', function (Request $request, \App\Models\Topic $topic) {
        if ($topic->subject->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'is_completed' => 'boolean',
            'title' => 'nullable|string|max:255',
            'difficulty' => 'nullable|integer|min:1|max:5',
            'estimated_hours' => 'nullable|numeric',
        ]);

        $topic->update($validated);

        return redirect()->back();
    })->name('topics.update');

    Route::delete('/topics/{topic}', function (\App\Models\Topic $topic) {
        if ($topic->subject->user_id !== auth()->id()) {
            abort(403);
        }
        $topic->delete();
        return redirect()->back();
    })->name('topics.destroy');

    // Study Materials & AI Tutor
    Route::get('/subjects/{subject}/materials', [StudyMaterialController::class, 'index'])->name('materials.index');
    Route::post('/subjects/{subject}/materials', [StudyMaterialController::class, 'store'])->name('materials.store');
    Route::get('/materials/{material}', [StudyMaterialController::class, 'show'])->name('materials.show');
    Route::delete('/materials/{material}', [StudyMaterialController::class, 'destroy'])->name('materials.destroy');
    Route::post('/materials/{material}/chat', [ChatController::class, 'store'])->name('materials.chat');

    Route::post('/plans/generate', function (GeneratePlanRequest $request, StudyPlanGenerator $generator) {
        $user = auth()->user();
        $planDate = now(); // Defaults to today for web interface
        $generator->generatePlanForUser($user, $planDate, $request->validated('available_minutes'));
        return redirect()->back();
    })->name('plans.generate');

    Route::patch('/tasks/{task}', function (Request $request, DailyTask $task) {
        if ($task->plan->user_id !== auth()->id()) {
            abort(403);
        }
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);
        $task->update(['status' => $validated['status']]);
        return redirect()->back();
    })->name('tasks.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/demo-data', function () {
        $user = auth()->user();

        // Math
        $math = \App\Models\Subject::create([
            'user_id' => $user->id,
            'name' => 'Mathematics',
            'exam_date' => now()->addDays(5),
            'priority_level' => 5
        ]);
        $math->topics()->createMany([
            ['title' => 'Calculus I - Limits', 'difficulty' => 4, 'estimated_hours' => 2.5, 'is_completed' => false],
            ['title' => 'Calculus II - Integrals', 'difficulty' => 5, 'estimated_hours' => 3.0, 'is_completed' => false],
            ['title' => 'Linear Algebra', 'difficulty' => 3, 'estimated_hours' => 2.0, 'is_completed' => false],
        ]);

        // Physics
        $physics = \App\Models\Subject::create([
            'user_id' => $user->id,
            'name' => 'Physics',
            'exam_date' => now()->addDays(12),
            'priority_level' => 4
        ]);
        $physics->topics()->createMany([
            ['title' => 'Newtonian Mechanics', 'difficulty' => 3, 'estimated_hours' => 1.5, 'is_completed' => false],
            ['title' => 'Thermodynamics', 'difficulty' => 4, 'estimated_hours' => 2.0, 'is_completed' => false],
            ['title' => 'Quantum Basics', 'difficulty' => 5, 'estimated_hours' => 4.0, 'is_completed' => false],
        ]);

        // History
        $history = \App\Models\Subject::create([
            'user_id' => $user->id,
            'name' => 'World History',
            'exam_date' => now()->addDays(20),
            'priority_level' => 2
        ]);
        $history->topics()->createMany([
            ['title' => 'Renaissance', 'difficulty' => 2, 'estimated_hours' => 1.0, 'is_completed' => false],
            ['title' => 'Industrial Revolution', 'difficulty' => 2, 'estimated_hours' => 1.5, 'is_completed' => false],
        ]);

        return redirect()->route('dashboard');
    })->name('demo.store');
});

Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->name('password.request');

Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');

require __DIR__ . '/auth.php';
