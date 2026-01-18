<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgressLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic_id' => 'required|uuid',
            'log_date' => 'required|date',
            'minutes_studied' => 'required|integer|min:0',
            'completion_status' => 'required|string|in:completed,partial,missed',
        ];
    }
}
