<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Http\Requests\Topic\StoreTopicRequest;
use App\Http\Requests\Topic\UpdateTopicRequest;
use App\Http\Resources\TopicResource;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    public function index(Request $request, Subject $subject): AnonymousResourceCollection
    {
        $this->authorize('viewTopics', $subject);
        
        $query = $subject->topics();

        $builder = new \App\Services\ApiQueryBuilder($query, $request);
        $topics = $builder->apply()->paginate(20);

        return TopicResource::collection($topics);
    }

    public function store(StoreTopicRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('create', [$subject]);
        
        $topic = $subject->topics()->create($request->validated());
        
        return response()->json(new TopicResource($topic), 201);
    }

    public function update(UpdateTopicRequest $request, Topic $topic): JsonResponse
    {
        $this->authorize('update', $topic);
        
        $topic->update($request->validated());
        
        return response()->json(new TopicResource($topic));
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $this->authorize('delete', $topic);
        
        $topic->delete();
        
        return response()->json(['deleted' => true]);
    }
}
