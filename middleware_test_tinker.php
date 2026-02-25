use Illuminate\Support\Facades\Http;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\User;

// 1. Get User and Token
$user = User::where('email', 'testauth@example.com')->first();
$token = JWTAuth::fromUser($user);
$headers = ['Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json'];

echo "Testing Middleware & RBAC...\n";

// 2. Test Protected Route (Profile)
$response = Http::withHeaders($headers)->get('http://127.0.0.1:8000/api/v1/profile');
if ($response->successful()) {
echo "[PASS] Profile Access (200 OK)\n";
} else {
echo "[FAIL] Profile Access: " . $response->status() . "\n";
}

// 3. Test Admin Route (As User) - Should Fail
$response = Http::withHeaders($headers)->get('http://127.0.0.1:8000/api/v1/admin-only');
if ($response->status() === 403) {
echo "[PASS] Admin Route (User Role) - 403 Forbidden\n";
} else {
echo "[FAIL] Admin Route (User Role): " . $response->status() . " (Expected 403)\n";
}

// 4. Test Admin Route (As Admin)
$user->role = 'admin';
$user->save();
// Refresh token to include new role if it's in claims (our getJWTCustomClaims includes role)
$adminToken = JWTAuth::fromUser($user);
$adminHeaders = ['Authorization' => 'Bearer ' . $adminToken, 'Accept' => 'application/json'];

$response = Http::withHeaders($adminHeaders)->get('http://127.0.0.1:8000/api/v1/admin-only');
if ($response->successful()) {
echo "[PASS] Admin Route (Admin Role) - 200 OK\n";
} else {
echo "[FAIL] Admin Route (Admin Role): " . $response->status() . "\n";
}

// Reset Role
$user->role = 'user';
$user->save();