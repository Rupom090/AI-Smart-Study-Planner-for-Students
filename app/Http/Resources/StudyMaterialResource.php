<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudyMaterialResource extends JsonResource
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
            'title' => $this->title,
            'document_type' => $this->document_type,
            'status' => $this->status,
            'content_extracted' => $this->when($request->user()?->id === $this->user_id, $this->content_extracted),
            'ai_analysis' => $this->when($request->user()?->id === $this->user_id, $this->ai_analysis),
            'file' => new FileResource($this->whenLoaded('file')),
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'messages_count' => $this->chat_messages_count ?? $this->chatMessages()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
