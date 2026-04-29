<?php

namespace App\Http\Requests\Subject;

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
            'name'           => 'sometimes|string|max:255',
            'description'    => 'sometimes|nullable|string|max:1000',
            'color'          => 'sometimes|nullable|string|max:30',
            'icon'           => 'sometimes|nullable|string|max:50',
            'exam_date'      => 'sometimes|nullable|date',
            'priority_level' => 'sometimes|integer|min:1|max:5',
        ];
    }
}
