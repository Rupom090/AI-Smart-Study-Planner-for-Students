<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

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

    /**
     * Return all user materials as JSON for the sidebar.
     */
    public function apiIndex()
    {
        $materials = StudyMaterial::where('user_id', auth()->id())
            ->with(['file', 'subject'])
            ->latest()
            ->get();

        return response()->json($materials);
    }

    /**
     * Rename a material.
     */
    public function update(Request $request, StudyMaterial $folder)
    {
        if ($folder->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $folder->update(['title' => $validated['title']]);

        return response()->json(['success' => true, 'title' => $folder->title]);
    }

    /**
     * Delete a material from the folder.
     */
    public function destroy(StudyMaterial $folder)
    {
        if ($folder->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete the associated file from storage
        if ($folder->file) {
            $storagePath = $folder->file->storage_path ?? $folder->file->path ?? null;
            if ($storagePath) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($storagePath);
            }
            $folder->file->delete();
        }

        $folder->delete();

        return response()->json(['success' => true]);
    }
}
