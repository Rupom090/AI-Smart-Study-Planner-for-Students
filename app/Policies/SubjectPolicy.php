<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    /**
     * Determine if user can view the subject
     */
    public function view(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    /**
     * Determine if user can create subjects
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if user can update the subject
     */
    public function update(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    /**
     * Determine if user can delete the subject
     */
    public function delete(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    /**
     * Determine if user can view topics of the subject
     */
    public function viewTopics(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }
}
