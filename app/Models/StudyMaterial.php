<?php

namespace App\Models;

use App\Enums\DocumentType;
use App\Enums\StudyMaterialStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudyMaterial extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'subject_id',
        'file_id',
        'title',
        'document_type',
        'content_extracted',
        'ai_analysis',
        'status',
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'document_type' => DocumentType::class,
        'status' => StudyMaterialStatus::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (StudyMaterial $model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
