$user = App\Models\User::where('email', 'testauth@example.com')->first();
if (!$user) {
$user = App\Models\User::create([
'name' => 'Test Auth',
'email' => 'testauth@example.com',
'password' => Hash::make('password'),
'role' => 'user',
'is_active' => true
]);
}
echo "User ID: " . $user->id . "\n";
echo "Role: " . $user->role . "\n";
$token = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($user);
echo "Token: " . substr($token, 0, 10) . "...\n";