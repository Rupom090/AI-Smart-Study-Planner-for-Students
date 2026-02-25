<?php

namespace App\Services\External;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

abstract class BaseExternalService
{
    protected string $baseUrl;
    protected array $headers = [];
    protected int $timeout = 30;
    protected int $retries = 3;
    protected int $cacheMinutes = 60;

    /**
     * Make GET request
     */
    protected function get(string $endpoint, array $params = [], bool $cache = false): array
    {
        $cacheKey = $cache ? $this->getCacheKey('get', $endpoint, $params) : null;

        if ($cache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $response = Http::withHeaders($this->headers)
            ->timeout($this->timeout)
            ->retry($this->retries, 100)
            ->get($this->baseUrl . $endpoint, $params);

        $this->handleResponse($response);

        $data = $response->json();

        if ($cache && $cacheKey) {
            Cache::put($cacheKey, $data, now()->addMinutes($this->cacheMinutes));
        }

        return $data;
    }

    /**
     * Make POST request
     */
    protected function post(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders($this->headers)
            ->timeout($this->timeout)
            ->retry($this->retries, 100)
            ->post($this->baseUrl . $endpoint, $data);

        $this->handleResponse($response);

        return $response->json();
    }

    /**
     * Handle response and throw exceptions if needed
     */
    protected function handleResponse($response): void
    {
        if ($response->failed()) {
            throw new \Exception(
                "API request failed: " . $response->body(),
                $response->status()
            );
        }
    }

    /**
     * Generate cache key
     */
    protected function getCacheKey(string $method, string $endpoint, array $params = []): string
    {
        return md5($method . $endpoint . json_encode($params));
    }

    /**
     * Clear cache for specific endpoint
     */
    protected function clearCache(string $method, string $endpoint, array $params = []): void
    {
        $cacheKey = $this->getCacheKey($method, $endpoint, $params);
        Cache::forget($cacheKey);
    }
}
