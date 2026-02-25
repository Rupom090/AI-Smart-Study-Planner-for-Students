<?php

namespace App\Services;

use League\Csv\Writer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class ExportService
{
    /**
     * Export data to CSV
     */
    public function exportToCsv(Collection $data, array $headers, string $filename = null): string
    {
        $filename = $filename ?? 'export_' . time() . '.csv';
        $path = 'exports/' . $filename;

        $csv = Writer::createFromString();
        
        // Insert headers
        $csv->insertOne($headers);

        // Insert data rows
        foreach ($data as $row) {
            $csvRow = [];
            foreach ($headers as $header) {
                $key = strtolower(str_replace(' ', '_', $header));
                $csvRow[] = $row->$key ?? '';
            }
            $csv->insertOne($csvRow);
        }

        // Save to storage
        Storage::disk('public')->put($path, $csv->toString());

        return Storage::url($path);
    }

    /**
     * Export array data to CSV
     */
    public function exportArrayToCsv(array $data, string $filename = null): string
    {
        $filename = $filename ?? 'export_' . time() . '.csv';
        $path = 'exports/' . $filename;

        $csv = Writer::createFromString();

        // Get headers from first row
        if (!empty($data)) {
            $headers = array_keys($data[0]);
            $csv->insertOne($headers);
        }

        // Insert data
        foreach ($data as $row) {
            $csv->insertOne(array_values($row));
        }

        // Save to storage
        Storage::disk('public')->put($path, $csv->toString());

        return Storage::url($path);
    }

    /**
     * Export to JSON
     */
    public function exportToJson(Collection $data, string $filename = null): string
    {
        $filename = $filename ?? 'export_' . time() . '.json';
        $path = 'exports/' . $filename;

        $json = json_encode($data, JSON_PRETTY_PRINT);

        Storage::disk('public')->put($path, $json);

        return Storage::url($path);
    }

    /**
     * Clean up old exports
     */
    public function cleanupOldExports(int $daysOld = 7): int
    {
        $files = Storage::disk('public')->files('exports');
        $deleted = 0;
        $cutoffTime = now()->subDays($daysOld)->timestamp;

        foreach ($files as $file) {
            $lastModified = Storage::disk('public')->lastModified($file);
            
            if ($lastModified < $cutoffTime) {
                Storage::disk('public')->delete($file);
                $deleted++;
            }
        }

        return $deleted;
    }
}
