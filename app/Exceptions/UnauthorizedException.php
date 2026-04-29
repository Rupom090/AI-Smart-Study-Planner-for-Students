<?php

namespace App\Exceptions;

use Exception;

class UnauthorizedException extends Exception
{
    public function __construct(string $message = 'Unauthorized action', int $code = 403)
    {
        parent::__construct($message, $code);
    }
}
