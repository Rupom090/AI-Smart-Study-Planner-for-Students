<?php

namespace App\Exceptions;

use Exception;

class AppError extends Exception
{
    protected $statusCode;
    protected $details;

    public function __construct(string $message, int $statusCode = 400, array $details = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->details = $details;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getDetails(): array
    {
        return $this->details;
    }
}
