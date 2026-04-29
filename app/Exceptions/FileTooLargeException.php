<?php

namespace App\Exceptions;

use Exception;

class FileTooLargeException extends Exception
{
    public function __construct(int $maxSize = 10485760, int $code = 413)
    {
        $maxMB = $maxSize / 1024 / 1024;
        $message = "File size exceeds maximum allowed size of {$maxMB}MB";
        parent::__construct($message, $code);
    }
}
