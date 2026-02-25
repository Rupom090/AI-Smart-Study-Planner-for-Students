<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <div id="message" class="hidden mb-4 p-3 rounded text-sm"></div>
        <form id="resetPasswordForm" class="space-y-4">
            <input type="hidden" id="token" value="{{ $token }}">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-400">Email Address</label>
                <input type="email" id="email" name="email" value="{{ request()->email }}" required
                    class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
                <label for="password" class="block text-sm font-medium text-gray-400">New Password</label>
                <input type="password" id="password" name="password" required
                    class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500">
                <p class="text-xs text-gray-500 mt-1">Min 8 chars, mixed case, number, symbol.</p>
            </div>
            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-gray-400">Confirm
                    Password</label>
                <input type="password" id="password_confirmation" name="password_confirmation" required
                    class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500">
            </div>
            <button type="submit"
                class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition duration-200">
                Reset Password
            </button>
        </form>
    </div>

    <script>
        document.getElementById('resetPasswordForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const token = document.getElementById('token').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirmation = document.getElementById('password_confirmation').value;

            const messageDiv = document.getElementById('message');
            const button = e.target.querySelector('button');

            button.disabled = true;
            button.innerText = 'Resetting...';
            messageDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/v1/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ token, email, password, password_confirmation })
                });
                const data = await response.json();

                messageDiv.classList.remove('hidden');
                if (response.ok) {
                    messageDiv.className = 'mb-4 p-3 rounded text-sm bg-green-900 text-green-200';
                    messageDiv.innerText = data.message;
                    setTimeout(() => window.location.href = '/login', 2000);
                } else {
                    messageDiv.className = 'mb-4 p-3 rounded text-sm bg-red-900 text-red-200';
                    // Check if details exist (validation error)
                    if (data.error && data.error.details) {
                        messageDiv.innerHTML = Object.values(data.error.details).flat().join('<br>');
                    } else {
                        messageDiv.innerText = data.message || 'Error occurred';
                    }
                }
            } catch (error) {
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'mb-4 p-3 rounded text-sm bg-red-900 text-red-200';
                messageDiv.innerText = 'Network Error';
            }
            button.disabled = false;
            button.innerText = 'Reset Password';
        });
    </script>
</body>

</html>