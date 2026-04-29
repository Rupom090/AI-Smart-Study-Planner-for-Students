<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Http\Requests\Subject\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user() ?? Auth::user();
        $query = Subject::where('user_id', $user->id)->with('topics');

        $builder = new \App\Services\ApiQueryBuilder($query, $request);
        $subjects = $builder->apply()->paginate(20);

        return SubjectResource::collection($subjects);
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        
        $this->authorize('create', Subject::class);
        
        $subject = Subject::create(array_merge($request->validated(), ['user_id' => $user->id]));
        
        return response()->json(
            new SubjectResource($subject->load('topics')),
            201
        );
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);
        
        $subject->update($request->validated());
        
        return response()->json(new SubjectResource($subject));
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);
        
        $subject->delete();
        
        return response()->json(['deleted' => true]);
    }
}
