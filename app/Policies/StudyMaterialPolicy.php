<?php

namespace App\Policies;

use App\Models\StudyMaterial;
use App\Models\User;

class StudyMaterialPolicy
{
    /**
     * Determine if user can view the material
     */
    public function view(User $user, StudyMaterial $material): bool
    {
        return $user->id === $material->user_id;
    }

    /**
     * Determine if user can create materials
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if user can update the material
     */
    public function update(User $user, StudyMaterial $material): bool
    {
        return $user->id === $material->user_id;
    }

    /**
     * Determine if user can delete the material
     */
    public function delete(User $user, StudyMaterial $material): bool
    {
        return $user->id === $material->user_id;
    }

    /**
     * Determine if user can chat with the material
     */
    public function chat(User $user, StudyMaterial $material): bool
    {
        return $user->id === $material->user_id;
    }
}
