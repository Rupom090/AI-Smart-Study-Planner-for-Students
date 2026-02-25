<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Exception;

class HealthService
{
    /**
     * Check the application health.
     *
     * @return array
     */
    public function checkHealth(): array
    {
        $dbStatus = 'unknown';

        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (Exception $e) {
            $dbStatus = 'disconnected';
        }

        return [
            'status' => 'operational',
            'timestamp' => now()->toIso8601String(),
            'database' => $dbStatus,
            'environment' => app()->environment(),
        ];
    }
}
