<?php

namespace App\Policies;

use App\Models\DailyPlan;
use App\Models\User;

class DailyPlanPolicy
{
    /**
     * Determine if user can view the plan
     */
    public function view(User $user, DailyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }

    /**
     * Determine if user can create plans
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if user can update the plan
     */
    public function update(User $user, DailyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }

    /**
     * Determine if user can delete the plan
     */
    public function delete(User $user, DailyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }

    /**
     * Determine if user can regenerate the plan
     */
    public function regenerate(User $user, DailyPlan $plan): bool
    {
        return $user->id === $plan->user_id;
    }
}
