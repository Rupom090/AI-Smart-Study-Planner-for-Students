<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;

class TopicPolicy
{
    /**
     * Determine if user can view topics of a subject
     */
    public function viewTopics(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    /**
     * Determine if user can create topics in a subject
     */
    public function create(User $user, Subject $subject): bool
    {
        return $user->id === $subject->user_id;
    }

    /**
     * Determine if user can update a topic
     */
    public function update(User $user, Topic $topic): bool
    {
        return $user->id === $topic->subject->user_id;
    }

    /**
     * Determine if user can delete a topic
     */
    public function delete(User $user, Topic $topic): bool
    {
        return $user->id === $topic->subject->user_id;
    }
}
