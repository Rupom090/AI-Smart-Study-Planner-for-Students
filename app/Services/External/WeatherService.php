<?php

namespace App\Services\External;

/**
 * Example: Weather API Service
 * Uncomment and configure when you need weather integration
 */
class WeatherService extends BaseExternalService
{
    public function __construct()
    {
        $this->baseUrl = env('WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5');
        $this->headers = [
            'Accept' => 'application/json',
        ];
    }

    /**
     * Get current weather for a city
     */
    public function getCurrentWeather(string $city): array
    {
        return $this->get('/weather', [
            'q' => $city,
            'appid' => env('WEATHER_API_KEY'),
            'units' => 'metric',
        ], cache: true);
    }

    /**
     * Get weather forecast
     */
    public function getForecast(string $city, int $days = 5): array
    {
        return $this->get('/forecast', [
            'q' => $city,
            'appid' => env('WEATHER_API_KEY'),
            'cnt' => $days * 8, // 8 forecasts per day (every 3 hours)
            'units' => 'metric',
        ], cache: true);
    }
}
