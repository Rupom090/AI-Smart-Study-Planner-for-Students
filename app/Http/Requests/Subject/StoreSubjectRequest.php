<?php

namespace App\Http\Requests\Subject;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'color'          => 'nullable|string|max:30',
            'icon'           => 'nullable|string|max:50',
            'exam_date'      => 'nullable|date',
            'priority_level' => 'nullable|integer|min:1|max:5',
        ];
    }
}
