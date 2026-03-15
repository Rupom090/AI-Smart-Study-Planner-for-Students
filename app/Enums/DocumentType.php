<?php

namespace App\Enums;

enum DocumentType: string
{
    case DOCUMENT = 'document';
    case IMAGE = 'image';
    case AUDIO = 'audio';
    case VIDEO = 'video';
    case PRESENTATION = 'presentation';
    case FILE = 'file';

    public function label(): string
    {
        return match ($this) {
            self::DOCUMENT => 'Document',
            self::IMAGE => 'Image',
            self::AUDIO => 'Audio',
            self::VIDEO => 'Video',
            self::PRESENTATION => 'Presentation',
            self::FILE => 'File',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::DOCUMENT => 'DocumentIcon',
            self::IMAGE => 'ImageIcon',
            self::AUDIO => 'SpeakerIcon',
            self::VIDEO => 'PlayIcon',
            self::PRESENTATION => 'PresentationIcon',
            self::FILE => 'DocumentIcon',
        };
    }
}
