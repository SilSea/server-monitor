/**
 * Dashboard Client-Side Application
 * Manages real-time data synchronization, interactive terminal sessions, 
 * and automatic connection recovery.
 */

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;

// ==========================================
// Real-time Metrics Synchronization
// ==========================================
let statsWs;

/**
 * Initializes and maintains the WebSocket connection for system metrics.
 * Implements exponential backoff or fixed delay for automatic reconnection.
 */
function connectStatsWebSocket() {
    statsWs = new WebSocket(`${protocol}//${host}/ws/stats`);

    statsWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        document.getElementById('cpu-text').innerText = data.cpu.load;
        document.getElementById('cpu-bar').style.width = data.cpu.load + '%';
        document.getElementById('cpu-cores').innerText = data.cpu.cores + ' Cores';
        
        document.getElementById('mem-text').innerText = data.mem.used;
        document.getElementById('mem-total').innerText = data.mem.total;
        document.getElementById('mem-bar').style.width = data.mem.percent + '%';
        document.getElementById('mem-percent').innerText = data.mem.percent + '%';
        
        document.getElementById('uptime-text').innerText = data.os.uptime;
        document.getElementById('os-text').innerText = data.os.distro;
        document.getElementById('platform-text').innerText = data.os.kernel;
    };

    statsWs.onclose = () => {
        setTimeout(connectStatsWebSocket, 3000);
    };

    statsWs.onerror = () => {
        statsWs.close();
    };
}

// ==========================================
// Interactive Terminal Interface
// ==========================================
const term = new Terminal({
    theme: { background: '#0a0a0f', foreground: '#d1d5db', cursor: '#3b82f6' },
    fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
    fontSize: 14,
    cursorBlink: true
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

term.open(document.getElementById('terminal-container'));
fitAddon.fit();

let termWs;

/**
 * Initializes and maintains the WebSocket connection for the terminal session.
 * Automatically restores session connectivity upon disconnection.
 */
function connectTerminalWebSocket() {
    termWs = new WebSocket(`${protocol}//${host}/ws/terminal`);

    termWs.onopen = () => {
        term.focus();
        term.write('\r\n\x1b[32m[System]\x1b[0m Connected to terminal server.\r\n');
    };

    termWs.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'data') {
            term.write(msg.data);
        }
    };

    termWs.onclose = () => {
        term.write('\r\n\x1b[31m[System]\x1b[0m Connection lost. Reconnecting...\r\n');
        setTimeout(connectTerminalWebSocket, 3000);
    };

    termWs.onerror = () => {
        termWs.close();
    };
}

/**
 * Transmits terminal input to the backend server.
 */
term.onData(data => {
    if (termWs && termWs.readyState === WebSocket.OPEN) {
        termWs.send(JSON.stringify({ type: 'input', data }));
    }
});

/**
 * Adjusts terminal dimensions dynamically upon window resize.
 */
window.addEventListener('resize', () => {
    fitAddon.fit();
    if (termWs && termWs.readyState === WebSocket.OPEN) {
        termWs.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
    }
});

// Initialize WebSocket Connections
connectStatsWebSocket();
connectTerminalWebSocket();

// ==========================================
// System Power Management
// ==========================================
/**
 * Dispatches a power action to the server.
 * @param {'reboot' | 'shutdown'} action - The desired power state.
 */
async function handlePower(action) {
    const isConfirm = confirm(`Are you sure you want to ${action.toUpperCase()} the server?`);
    if (!isConfirm) return;

    try {
        const res = await fetch('/api/power', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        
        if (res.ok) {
            alert(`Server is going to ${action}... Connection will be lost.`);
            setTimeout(() => window.location.reload(), 3000); 
        } else {
            alert('Failed to execute power command.');
        }
    } catch (error) {
        alert('An error occurred while communicating with the server.');
    }
}