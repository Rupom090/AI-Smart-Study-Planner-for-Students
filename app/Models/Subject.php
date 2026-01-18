<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'exam_date',
        'priority_level',
    ];

    protected $casts = [
        'exam_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Subject $subject) {
            if (! $subject->getKey()) {
                $subject->{$subject->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function topics()
    {
        return $this->hasMany(Topic::class);
    }
}
