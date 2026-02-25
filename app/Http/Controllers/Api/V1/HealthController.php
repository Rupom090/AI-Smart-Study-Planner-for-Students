<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\HealthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthController extends BaseApiController
{
    protected HealthService $healthService;

    public function __construct(HealthService $healthService)
    {
        $this->healthService = $healthService;
    }

    /**
     * Check system health.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $healthData = $this->healthService->checkHealth();

        return $this->successResponse(
            $healthData,
            'System operational'
        );
    }
}
