<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailyTaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plan_id' => $this->plan_id,
            'topic_id' => $this->topic_id,
            'title' => $this->title,
            'details' => $this->details,
            'status' => $this->status,
            'duration_minutes' => $this->duration_minutes,
            'order' => $this->order,
            'topic' => new TopicResource($this->whenLoaded('topic')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
