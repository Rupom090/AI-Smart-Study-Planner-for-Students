<?php

namespace App\Providers;

use App\Models\DailyPlan;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Policies\DailyPlanPolicy;
use App\Policies\StudyMaterialPolicy;
use App\Policies\SubjectPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register authorization policies
        Gate::policy(Subject::class, SubjectPolicy::class);
        Gate::policy(StudyMaterial::class, StudyMaterialPolicy::class);
        Gate::policy(DailyPlan::class, DailyPlanPolicy::class);
    }
}
