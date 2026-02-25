<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessEmail implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Simulate sending email
        \Illuminate\Support\Facades\Log::info('Processing email job...');
        sleep(1);
        \Illuminate\Support\Facades\Log::info('Email processed successfully.');
    }
}
