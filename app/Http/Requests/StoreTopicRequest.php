<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'difficulty' => 'nullable|integer|min:1|max:5',
            'estimated_hours' => 'nullable|numeric|min:0',
        ];
    }
}
