import { spawn, exec } from "child_process";

/**
 * Initializes a pseudo-terminal (PTY) process natively using Ubuntu's 'script' utility.
 * This approach bypasses third-party C++ modules for maximum stability in the Bun environment.
 */
export const createPtyProcess = () => {
    const shellProcess = spawn('script', ['-q', '/dev/null'], {
        env: {
            ...process.env,
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8'
        }
    });

    return {
        onData: (callback: (data: string) => void) => {
            shellProcess.stdout?.on('data', (data) => callback(data.toString()));
            shellProcess.stderr?.on('data', (data) => callback(data.toString()));
        },
        write: (data: string) => {
            shellProcess.stdin?.write(data);
        },
        resize: (cols: number, rows: number) => {
            // Native child_process does not support dynamic TTY resizing dynamically, handled gracefully.
        },
        kill: () => {
            shellProcess.kill();
        },
        onExit: (callback: (status: { exitCode: number | null, signal: string | null }) => void) => {
            shellProcess.on('exit', (code, signal) => {
                callback({ exitCode: code, signal: signal?.toString() || null });
            });
        }
    };
};

/**
 * Executes system-level power management commands.
 */
export const systemPower = (action: 'reboot' | 'shutdown'): boolean => {
    const cmd = action === 'reboot' ? 'sudo reboot' : 'sudo shutdown -h now';
    try {
        exec(cmd);
        return true;
    } catch (error) {
        return false;
    }
};