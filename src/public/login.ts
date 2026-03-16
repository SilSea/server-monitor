export const loginPage = (error?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-[#0f111a] flex items-center justify-center min-h-screen text-gray-200 font-sans p-4">
    <div class="w-full max-w-sm p-8 bg-[#1a1d27] rounded-2xl shadow-2xl border border-gray-800">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-semibold tracking-wide text-white">Console</h1>
        </div>
        ${error ? `<div class="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">Invalid credentials</div>` : ''}
        <form action="/login" method="POST" class="space-y-5">
            <div>
                <input type="text" name="username" placeholder="Username" class="w-full px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" required>
            </div>
            <div>
                <input type="password" name="password" placeholder="Password" class="w-full px-4 py-3 bg-[#0f111a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" required>
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors mt-2">
                Sign In
            </button>
        </form>
    </div>
</body>
</html>
`;