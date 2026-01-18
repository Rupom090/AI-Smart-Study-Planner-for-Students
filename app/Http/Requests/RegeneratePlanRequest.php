<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegeneratePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_date' => 'required|date',
            'available_minutes' => 'required|integer|min:15',
        ];
    }
}
