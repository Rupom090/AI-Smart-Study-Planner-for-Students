<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <div id="message" class="hidden mb-4 p-3 rounded text-sm"></div>
        <form id="forgotPasswordForm" class="space-y-4">
            <div>
                <label for="email" class="block text-sm font-medium text-gray-400">Email Address</label>
                <input type="email" id="email" name="email" required
                    class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500">
            </div>
            <button type="submit"
                class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white transition duration-200">
                Send Reset Link
            </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-400">
            Remembered? <a href="/login" class="text-blue-400 hover:underline">Log in</a>
        </p>
    </div>

    <script>
        document.getElementById('forgotPasswordForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const messageDiv = document.getElementById('message');
            const button = e.target.querySelector('button');

            button.disabled = true;
            button.innerText = 'Sending...';
            messageDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/v1/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();

                messageDiv.classList.remove('hidden');
                if (response.ok) {
                    messageDiv.className = 'mb-4 p-3 rounded text-sm bg-green-900 text-green-200';
                    messageDiv.innerText = data.message;
                } else {
                    messageDiv.className = 'mb-4 p-3 rounded text-sm bg-red-900 text-red-200';
                    messageDiv.innerText = data.message || 'Error occurred';
                }
            } catch (error) {
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'mb-4 p-3 rounded text-sm bg-red-900 text-red-200';
                messageDiv.innerText = 'Network Error';
            }
            button.disabled = false;
            button.innerText = 'Send Reset Link';
        });
    </script>
</body>

</html>