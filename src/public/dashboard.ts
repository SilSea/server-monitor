export const dashboardPage = (user: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/assets/css/style.css">
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
    <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
</head>
<body class="bg-[#0f111a] text-gray-300 min-h-screen font-sans">
    <nav class="bg-[#1a1d27]/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 md:px-6 md:py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10">
        <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <h1 class="text-sm md:text-base font-medium text-white tracking-wide" id="os-text">Loading...</h1>
        </div>
        <div class="flex items-center gap-3 text-sm">
            <button onclick="handlePower('reboot')" class="hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-gray-400 hover:text-white">Reboot</button>
            <button onclick="handlePower('shutdown')" class="hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors text-gray-400 hover:text-white border-r border-gray-800 pr-4">Shutdown</button>
            <span class="text-gray-500 hidden md:inline">User: <span class="text-gray-300">${user}</span></span>
            <a href="/logout" class="text-blue-400 hover:text-blue-300 transition-colors ml-2">Logout</a>
        </div>
    </nav>

    <main class="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div class="bg-[#1a1d27] p-5 rounded-2xl border border-gray-800">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-sm font-medium text-gray-500">CPU Usage</h3>
                    <span id="cpu-cores" class="text-xs text-gray-600 bg-gray-900 px-2 py-1 rounded-md">-- Cores</span>
                </div>
                <div class="text-3xl font-light text-white mb-3"><span id="cpu-text">--</span><span class="text-lg text-gray-500 ml-1">%</span></div>
                <div class="w-full bg-gray-900 rounded-full h-1"><div id="cpu-bar" class="bg-blue-500 h-1 rounded-full transition-all duration-500" style="width: 0%"></div></div>
            </div>
            
            <div class="bg-[#1a1d27] p-5 rounded-2xl border border-gray-800">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-sm font-medium text-gray-500">Memory</h3>
                    <span id="mem-percent" class="text-xs text-gray-600 bg-gray-900 px-2 py-1 rounded-md">--%</span>
                </div>
                <div class="text-3xl font-light text-white mb-3"><span id="mem-text">--</span><span class="text-lg text-gray-500 ml-1">/ <span id="mem-total">--</span> GB</span></div>
                <div class="w-full bg-gray-900 rounded-full h-1"><div id="mem-bar" class="bg-purple-500 h-1 rounded-full transition-all duration-500" style="width: 0%"></div></div>
            </div>

            <div class="bg-[#1a1d27] p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
                <div>
                    <h3 class="text-sm font-medium text-gray-500 mb-4">System Uptime</h3>
                    <div class="text-xl md:text-2xl font-light text-white" id="uptime-text">--</div>
                </div>
                <div class="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-800 truncate">
                    Kernel: <span id="platform-text">--</span>
                </div>
            </div>
        </div>

        <div class="bg-[#0a0a0f] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[60vh] md:h-[500px]">
            <div class="bg-[#13151c] px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <span class="text-xs text-gray-600 ml-2 font-mono">Terminal (node-pty)</span>
            </div>
            
            <div id="terminal-container" class="flex-1 p-2 w-full h-full overflow-hidden focus:outline-none"></div>
        </div>
    </main>

    <script src="/assets/js/dashboard.js"></script>
</body>
</html>
`;