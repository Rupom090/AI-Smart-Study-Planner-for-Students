<?php

use App\Http\Controllers\Web\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Web\PlanController;
use App\Http\Controllers\Web\StudyMaterialController;
use App\Http\Controllers\Chat\ChatController;
use App\Models\DailyTask;
use App\Services\StudyPlanGenerator;
use App\Http\Requests\Plan\GeneratePlanRequest;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();

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

    // 4. Weekly Activity Data for Recharts
    $weeklyActivity = [];
    $today = \Carbon\Carbon::today();
    for ($i = 6; $i >= 0; $i--) {
        $date = $today->copy()->subDays($i);

        $materialsCount = \App\Models\StudyMaterial::where('user_id', $user->id)
            ->whereDate('created_at', $date)
            ->count();

        $topicsCompleted = \App\Models\Topic::whereHas('subject', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->where('is_completed', true)
            ->whereDate('updated_at', $date)
            ->count();

        $weeklyActivity[] = [
            'name' => $date->format('D'), // Mon, Tue, Wed
            'materials' => $materialsCount,
            'topics' => $topicsCompleted
        ];
    }

    return Inertia::render('Dashboard', [
        'subjects' => $subjects,
        'todaysPlan' => $todaysPlan,
        'stats' => $stats,
        'weeklyActivity' => $weeklyActivity
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/onboarding', function () {
        return Inertia::render('WelcomeOnboarding');
    })->name('onboarding');

    Route::get('/solve', function () {
        return Inertia::render('Solve');
    })->name('solve');

    Route::get('/paper-grader', function () {
        return Inertia::render('PaperGrader');
    })->name('paper-grader');

    Route::get('/flashcards', [\App\Http\Controllers\Web\FlashcardController::class, 'index'])->name('flashcards');

    Route::get('/subjects', function () {
        $subjects = \App\Models\Subject::where('user_id', Auth::id())
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
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'exam_date' => $validated['exam_date'],
            'priority_level' => $validated['priority_level'],
        ]);

        return redirect()->back();
    })->name('subjects.store');

    Route::get('/study-plan', function () {
        $plan = \App\Models\DailyPlan::with('tasks.topic.subject')
            ->where('user_id', Auth::id())
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
        if ($subject->user_id !== Auth::id()) {
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
        if ($subject->user_id !== Auth::id()) {
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
        if ($topic->subject->user_id !== Auth::id()) {
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
        if ($topic->subject->user_id !== Auth::id()) {
            abort(403);
        }
        $topic->delete();
        return redirect()->back();
    })->name('topics.destroy');

    // Study Materials & AI Tutor
    Route::get('/subjects/{subject}/materials', [StudyMaterialController::class, 'index'])->name('materials.index');
    Route::post('/subjects/{subject}/materials', [StudyMaterialController::class, 'store'])->name('materials.store');
    Route::get('/materials/{material}', [StudyMaterialController::class, 'show'])->name('materials.show');
    Route::get('/materials/{material}/file', [StudyMaterialController::class, 'viewFile'])->name('materials.file');
    Route::delete('/materials/{material}', [StudyMaterialController::class, 'destroy'])->name('materials.destroy');
    Route::post('/materials/{material}/chat', [ChatController::class, 'store'])->name('materials.chat');
    Route::patch('/materials/{material}/analysis', [StudyMaterialController::class, 'updateAnalysis'])->name('materials.analysis.update');
    Route::get('/document-chat', [\App\Http\Controllers\Chat\DocumentChatController::class, 'index'])->name('document-chat');

    // File Serving
    Route::get('/files/{file}/view', [\App\Http\Controllers\Web\FileServeController::class, 'show'])->name('files.view');
    Route::get('/files/{file}/download', [\App\Http\Controllers\Web\FileServeController::class, 'download'])->name('files.download');

    // Global File Manager
    Route::get('/folders', [\App\Http\Controllers\Web\FolderController::class, 'index'])->name('folders.index');
    Route::get('/api/folders', [\App\Http\Controllers\Web\FolderController::class, 'apiIndex'])->name('folders.api');
    Route::patch('/folders/{folder}', [\App\Http\Controllers\Web\FolderController::class, 'update'])->name('folders.update');
    Route::delete('/folders/{folder}', [\App\Http\Controllers\Web\FolderController::class, 'destroy'])->name('folders.destroy');

    Route::post('/plans/generate', function (GeneratePlanRequest $request, StudyPlanGenerator $generator) {
        $user = Auth::user();
        $planDate = now(); // Defaults to today for web interface
        $generator->generatePlanForUser($user, $planDate, $request->validated('available_minutes'));
        return redirect()->back();
    })->name('plans.generate');

    Route::patch('/tasks/{task}', function (Request $request, DailyTask $task) {
        if ($task->plan->user_id !== Auth::id()) {
            abort(403);
        }
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        $task->update(['status' => $validated['status']]);

        // If a task is completed, also mark its respective topic as completed.
        // If a task is reverted to pending/in_progress, unmark the topic.
        if ($validated['status'] === 'completed') {
            $task->topic()->update(['is_completed' => true]);
        } else {
            $task->topic()->update(['is_completed' => false]);
        }

        return redirect()->back();
    })->name('tasks.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/demo-data', function () {
        $user = Auth::user();

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
