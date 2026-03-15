<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'icon' => $this->icon,
            'topics_count' => $this->topics_count ?? $this->topics()->count(),
            'materials_count' => $this->materials_count ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'topics' => TopicResource::collection($this->whenLoaded('topics')),
        ];
    }
}
