<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user() ?? Auth::user();
        $subjects = Subject::where('user_id', $user->id)->with('topics')->orderBy('exam_date')->get();
        return response()->json($subjects);
    }

    public function store(StoreSubjectRequest $request)
    {
        $user = $request->user() ?? Auth::user();
        $subject = Subject::create(array_merge($request->validated(), ['user_id' => $user->id]));
        return response()->json($subject, 201);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $subject->update($request->validated());
        return response()->json($subject);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return response()->json(['deleted' => true]);
    }
}
