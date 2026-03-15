<?php

namespace App\Exceptions;

use Exception;

class InvalidFileTypeException extends Exception
{
    public function __construct(string $fileType = 'unknown', int $code = 422)
    {
        $message = "File type '{$fileType}' is not allowed";
        parent::__construct($message, $code);
    }
}
