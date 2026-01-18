<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string',
            'exam_date' => 'sometimes|date',
            'priority_level' => 'sometimes|integer|min:1|max:5',
        ];
    }
}
