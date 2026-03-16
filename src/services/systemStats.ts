import si from "systeminformation";

/**
 * Retrieves real-time system hardware and OS metrics.
 * @returns {Promise<Object>} Formatted system statistics payload.
 */
export const getServerStats = async () => {
    try {
        const currentLoad = await si.currentLoad();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const time = si.time();

        const uptimeSeconds = time.uptime;
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        let uptimeStr = "";
        if (days > 0) uptimeStr += `${days}d `;
        uptimeStr += `${hours}h ${minutes}m`;

        return {
            cpu: {
                load: currentLoad.currentLoad.toFixed(1),
                cores: currentLoad.cpus.length
            },
            mem: {
                used: (mem.active / (1024 ** 3)).toFixed(2),
                total: (mem.total / (1024 ** 3)).toFixed(2),
                percent: ((mem.active / mem.total) * 100).toFixed(1)
            },
            os: {
                distro: `${osInfo.distro} ${osInfo.release}`,
                kernel: `Kernel ${osInfo.kernel}`,
                uptime: uptimeStr
            }
        };
    } catch (error) {
        throw new Error("Failed to retrieve system metrics.");
    }
};