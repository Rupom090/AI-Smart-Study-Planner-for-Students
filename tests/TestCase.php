<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Feature tests post/patch/delete web routes directly without browser-issued
        // XSRF cookies/headers. Disabling CSRF middleware in tests prevents 419s
        // while keeping production middleware behavior unchanged.
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }
}
