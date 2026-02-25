use Illuminate\Support\Facades\Http;
use App\Models\User;
use Illuminate\Support\Facades\Password;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

echo "Testing Password Reset Flow...\n";

// 1. Forgot Password (Generate Token)
$user = User::where('email', 'testauth@example.com')->first();
$response = Http::withHeaders(['Accept' => 'application/json'])
->post('http://127.0.0.1:8000/api/v1/auth/forgot-password', ['email' => $user->email]);

echo "[Forgot Password] Status: " . $response->status() . " (Expected 200)\n";

// Manually get the token since we can't easily intercept the mail in tinker script without mailtrap API
// But we can generate a valid token manually to test the reset endpoint
$token = Password::broker()->createToken($user);
echo "Generated Test Token: " . substr($token, 0, 10) . "...\n";

// 2. Reset Password
$newPassword = 'NewResetPass1!';
$response = Http::withHeaders(['Accept' => 'application/json'])
->post('http://127.0.0.1:8000/api/v1/auth/reset-password', [
'token' => $token,
'email' => $user->email,
'password' => $newPassword,
'password_confirmation' => $newPassword
]);

echo "[Reset Password] Status: " . $response->status() . " (Expected 200)\n";
echo "Response: " . $response->body() . "\n";

// 3. Verify Login with New Password
$response = Http::post('http://127.0.0.1:8000/api/v1/auth/login', [
'email' => $user->email,
'password' => $newPassword
]);

if ($response->successful()) {
echo "[PASS] Login with New Password Successful\n";
} else {
echo "[FAIL] Login Failed: " . $response->body() . "\n";
}