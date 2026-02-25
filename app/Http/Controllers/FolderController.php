<?php

namespace App\Http\Controllers;

use App\Models\StudyMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FolderController extends Controller
{
    /**
     * Display a global view of all user uploaded materials.
     */
    public function index()
    {
        $materials = StudyMaterial::where('user_id', auth()->id())
            ->with(['file', 'subject'])
            ->latest()
            ->get();

        return Inertia::render('Folders/Index', [
            'materials' => $materials
        ]);
    }
}
