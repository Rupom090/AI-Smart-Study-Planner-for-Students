<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Subject;
use App\Models\Topic;

class TopicController extends Controller
{
    public function index(Subject $subject)
    {
        return response()->json($subject->topics()->orderBy('created_at')->get());
    }

    public function store(StoreTopicRequest $request, Subject $subject)
    {
        $topic = $subject->topics()->create($request->validated());
        return response()->json($topic, 201);
    }

    public function update(UpdateTopicRequest $request, Topic $topic)
    {
        $topic->update($request->validated());
        return response()->json($topic);
    }

    public function destroy(Topic $topic)
    {
        $topic->delete();
        return response()->json(['deleted' => true]);
    }
}
