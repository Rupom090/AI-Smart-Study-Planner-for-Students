<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string',
            'difficulty' => 'sometimes|integer|min:1|max:5',
            'estimated_hours' => 'sometimes|numeric|min:0',
            'is_completed' => 'sometimes|boolean',
        ];
    }
}
