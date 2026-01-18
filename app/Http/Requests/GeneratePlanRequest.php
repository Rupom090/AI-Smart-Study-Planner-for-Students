<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'available_minutes' => 'required|integer|min:15',
            'regenerate_for_date' => 'nullable|date',
        ];
    }
}
