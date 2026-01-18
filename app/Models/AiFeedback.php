<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AiFeedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_date',
        'input_summary',
        'ai_response_summary',
    ];

    protected $casts = [
        'plan_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (AiFeedback $feedback) {
            if (! $feedback->getKey()) {
                $feedback->{$feedback->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
