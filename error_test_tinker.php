use Illuminate\Support\Facades\Http;

echo "Testing Error Handling...\n";

// 1. Validation Error (422)
// Sending empty signup request
$response = Http::withHeaders(['Accept' => 'application/json'])->post('http://127.0.0.1:8000/api/v1/auth/signup', []);
echo "[Validation Error] Status: " . $response->status() . " (Expected 422)\n";
echo "Response: " . $response->body() . "\n\n";

// 2. Not Found Error (404)
$response = Http::withHeaders(['Accept' => 'application/json'])->get('http://127.0.0.1:8000/api/v1/non-existent-route');
echo "[Not Found Error] Status: " . $response->status() . " (Expected 404)\n";
echo "Response: " . $response->body() . "\n\n";

// 3. Auth Error (401)
// Accessing protected profile route without token
$response = Http::withHeaders(['Accept' => 'application/json'])->get('http://127.0.0.1:8000/api/v1/profile');
echo "[Auth Error] Status: " . $response->status() . " (Expected 401)\n";
echo "Response: " . $response->body() . "\n\n";

// 4. Method Not Allowed (405) - Should be handled by generic handler or specific if mapped
$response = Http::withHeaders(['Accept' => 'application/json'])->get('http://127.0.0.1:8000/api/v1/auth/signup'); // GET
instead of POST
echo "[Method Not Allowed] Status: " . $response->status() . " (Expected 405 or 500)\n";
echo "Response: " . $response->body() . "\n\n";