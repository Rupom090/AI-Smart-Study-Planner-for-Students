<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Subject;
use App\Models\Topic;

class TopicController extends Controller
{
    public function index(\Illuminate\Http\Request $request, Subject $subject)
    {
        $query = $subject->topics();

        $builder = new \App\Services\ApiQueryBuilder($query, $request);
        $topics = $builder->apply()->paginate(20);

        return response()->json($topics);
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
