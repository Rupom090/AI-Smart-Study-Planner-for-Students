<?php

namespace App\Exceptions;

use Exception;

class AiServiceUnavailableException extends Exception
{
    public function __construct(string $message = 'AI service is currently unavailable', int $code = 503)
    {
        parent::__construct($message, $code);
    }
}
