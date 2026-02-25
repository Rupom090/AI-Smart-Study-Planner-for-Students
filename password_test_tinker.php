use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

// 1. Test Complexity
$rules = ['password' => Password::min(8)->mixedCase()->numbers()->symbols()];
$weakPass = 'password';
$strongPass = 'Password123!';

$v1 = Validator::make(['password' => $weakPass], $rules);
echo "Weak Password Valid: " . ($v1->passes() ? 'Yes' : 'No') . "\n";

$v2 = Validator::make(['password' => $strongPass], $rules);
echo "Strong Password Valid: " . ($v2->passes() ? 'Yes' : 'No') . "\n";

// 2. Test Change Password Logic
$user = App\Models\User::where('email', 'testauth@example.com')->first();
if ($user) {
try {
$authService = app(App\Services\AuthService::class);
$authService->changePassword($user, 'password', 'NewStrongPass1!');
echo "Password Changed Successfully\n";

if (Hash::check('NewStrongPass1!', $user->fresh()->password)) {
echo "New Password Verified\n";
} else {
echo "New Password Verification Failed\n";
}
} catch (Exception $e) {
echo "Change Failed: " . $e->getMessage() . "\n";
}
}