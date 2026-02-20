const { exec } = require('child_process');
const os = require('os');
const isWindows = os.platform() === 'win32';

class LXDService {
    constructor() {
        this.mockMode = isWindows;
    }

    async execute(command) {
        if (this.mockMode) {
            console.log(`[MOCK LXD] Executing: lxc ${command}`);
            return Promise.resolve({ stdout: "Mock success", stderr: "" });
        }

        return new Promise((resolve, reject) => {
            exec(`lxc ${command}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[LXD Error] ${stderr}`);
                    return reject(stderr || error.message);
                }
                resolve({ stdout, stderr });
            });
        });
    }

    async createInstance(name, image) {
        // e.g., lxc launch ubuntu:22.04 my-vps
        return this.execute(`launch images:${image} ${name}`);
    }

    async deleteInstance(name) {
        return this.execute(`delete ${name} --force`);
    }

    async startInstance(name) {
        return this.execute(`start ${name}`);
    }

    async stopInstance(name) {
        return this.execute(`stop ${name} --force`);
    }

    async restartInstance(name) {
        return this.execute(`restart ${name}`);
    }

    async getInfo(name) {
        // lxc info my-vps --format json
        try {
            const { stdout } = await this.execute(`info ${name} --format json`);
            if (this.mockMode) {
                // Return mock data for Windows
                return {
                    name: name,
                    status: "Running", // variable?
                    state: {
                        cpu: { usage: Math.floor(Math.random() * 100) },
                        memory: { usage: Math.floor(Math.random() * 1024 * 1024 * 1024) }, // random bytes
                        network: { eth0: { addresses: [{ address: "192.168.1.100" }] } }
                    }
                };
            }
            return JSON.parse(stdout);
        } catch (e) {
            // If mock mode fails? Should not.
            if (this.mockMode) return {};
            throw e;
        }
    }
}

module.exports = new LXDService();
