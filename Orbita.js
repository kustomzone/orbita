"use strict";
const child_process_1 = require("child_process");
const electron = require("electron");
const modulePath = __dirname + "/start.js";
class Orbita {
    constructor() {
        this.windows = {};
    }
    setWindows(windowsConfigs) {
        const newIds = windowsConfigs.map((config) => config.id);
        let currentIds = Object.keys(this.windows);
        windowsConfigs.map((config) => {
            if (!this.windows[config.id]) {
                this.addWindow(config);
            }
            else {
                currentIds = currentIds.filter((id) => id !== config.id);
            }
        });
        currentIds.map((id) => this.removeWindow(id));
    }
    addWindow(config) {
        this.windows[config.id] = {
            config,
        };
        this.startWindow(config.id);
    }
    startWindow(id) {
        const config = this.windows[id].config;
        const args = [modulePath];
        if (config.url) {
            args.push("--url=" + config.url);
        }
        if (config.module) {
            args.push("--module=" + config.module);
        }
        const child = child_process_1.spawn(electron, args, {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        child.on("close", (code) => {
            setTimeout(() => {
                this.startWindow(config.id);
            }, 1000);
        });
    }
    removeWindow(id) {
        const window = this.windows[id];
        if (window.proc) {
            window.proc.kill();
        }
        delete this.windows[id];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Orbita;
