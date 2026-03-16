import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { jwt } from "@elysiajs/jwt";

import { loginPage } from "./public/login";
import { dashboardPage } from "./public/dashboard";
import { getServerStats } from "./services/systemStats";
import { createPtyProcess, systemPower } from "./services/terminal";

/**
 * Global state management for active connections.
 * Tracks metric polling intervals and active pseudo-terminal sessions
 * to ensure proper lifecycle management and resource cleanup.
 */
const activeIntervals = new Map<string, ReturnType<typeof setInterval>>();
const activePtys = new Map<string, { process: ReturnType<typeof createPtyProcess>; isAlive: boolean }>();

const app = new Elysia()
    /**
     * Core middleware configuration.
     * Registers HTML rendering, static file serving, and JWT authentication handling.
     */
    .use(html())
    .use(staticPlugin({ 
        assets: `${import.meta.dir}/public/assets`, 
        prefix: "/assets" 
    }))
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET,
        })
    )

    // ==========================================
    // View & Authentication Routes
    // ==========================================
    
    /**
     * Serves the authentication interface.
     */
    .get("/login", ({ html, query }) => html(loginPage(query.error as string)))
    
    /**
     * Serves the primary dashboard interface.
     * Validates the presence and integrity of the authentication token.
     */
    .get("/", async ({ html, jwt, cookie: { auth }, redirect }) => {
        if (!auth.value) return redirect("/login");
        
        const profile = await jwt.verify(auth.value);
        if (!profile) return redirect("/login");
        
        return html(dashboardPage(profile.user as string));
    })
    
    /**
     * Processes user authentication.
     * Validates credentials against environment variables and issues an HTTP-only JWT cookie.
     */
    .post("/login", async ({ body, jwt, cookie: { auth }, redirect }) => {
        const { username, password } = body;
        
        if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
            auth.set({
                value: await jwt.sign({ user: username }),
                httpOnly: true,
                maxAge: 86400,
                path: "/"
            });
            return redirect("/");
        }
        
        return redirect("/login?error=true");
    }, { 
        body: t.Object({ username: t.String(), password: t.String() }) 
    })
    
    /**
     * Terminates the user session by removing the authentication cookie.
     */
    .get("/logout", ({ cookie: { auth }, redirect }) => {
        auth.remove();
        return redirect("/login");
    })

    // ==========================================
    // WebSocket Streaming Channels
    // ==========================================
    
    /**
     * Establishes a unidirectional WebSocket channel for system metrics.
     * Broadcasts hardware statistics (CPU, RAM, Uptime) at a fixed interval.
     */
    .ws("/ws/stats", {
        open(ws) {
            const id = setInterval(async () => {
                try {
                    const stats = await getServerStats();
                    if (activeIntervals.has(ws.id)) {
                        ws.send(JSON.stringify(stats));
                    }
                } catch (error) {
                    // Suppresses retrieval errors to maintain the polling loop
                }
            }, 3000);
            activeIntervals.set(ws.id, id);
        },
        close(ws) {
            clearInterval(activeIntervals.get(ws.id));
            activeIntervals.delete(ws.id);
        }
    })

    /**
     * Establishes a bidirectional WebSocket channel for the web-based terminal.
     * Manages the lifecycle of the underlying OS process and routes I/O streams.
     */
    .ws("/ws/terminal", {
        open(ws) {
            const ptyProcess = createPtyProcess();
            const session = { process: ptyProcess, isAlive: true };
            activePtys.set(ws.id, session);
            
            ptyProcess.onData((data) => {
                if (!session.isAlive) return;
                try {
                    ws.send(JSON.stringify({ type: 'data', data }));
                } catch (err) {}
            });

            ptyProcess.onExit(() => {
                session.isAlive = false;
                activePtys.delete(ws.id);
                try {
                    ws.send(JSON.stringify({ 
                        type: 'data', 
                        data: '\r\n\x1b[31m[System]\x1b[0m Shell process terminated. Please reconnect.\r\n' 
                    }));
                } catch (e) {}
            });
        },
        message(ws, msg: any) {
            const session = activePtys.get(ws.id);
            if (!session || !session.isAlive) return;

            let parsed = msg;
            if (typeof msg === 'string') {
                try { parsed = JSON.parse(msg); } catch (e) { return; }
            }

            try {
                if (parsed.type === 'input') {
                    session.process.write(parsed.data);
                } else if (parsed.type === 'resize') {
                    if (parsed.cols > 0 && parsed.rows > 0) {
                        session.process.resize(parsed.cols, parsed.rows);
                    }
                }
            } catch (err) {
                session.isAlive = false;
                activePtys.delete(ws.id);
            }
        },
        close(ws) {
            const session = activePtys.get(ws.id);
            if (session) {
                session.isAlive = false;
                try { session.process.kill(); } catch (e) {}
                activePtys.delete(ws.id);
            }
        }
    })

    // ==========================================
    // System Control APIs
    // ==========================================
    
    /**
     * Processes system-level power commands.
     * Authenticates the request before dispatching signals to the host OS.
     */
    .post("/api/power", async ({ body, jwt, cookie: { auth }, set }) => {
        if (!auth.value || !(await jwt.verify(auth.value))) { 
            set.status = 401; 
            return { error: "Unauthorized access" }; 
        }
        
        const { action } = body as { action: 'reboot' | 'shutdown' };
        if (action === 'reboot' || action === 'shutdown') {
            systemPower(action); 
            return { success: true };
        }
        
        set.status = 400; 
        return { error: "Invalid operation" };
    }, { 
        body: t.Object({ action: t.String() }) 
    })

    .listen(3000);

console.log(`🦊 Web Dashboard is active at ${app.server?.hostname}:${app.server?.port}`);