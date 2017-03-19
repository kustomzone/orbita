import { ChildProcess, spawn } from "child_process";
import { BrowserWindow } from "electron";
import electron = require("electron");
interface IWindowConfig {
    id: string;
    url: string;
    module?: string;
    args?: any;
}
interface IWindow {
    proc?: ChildProcess;
    config: IWindowConfig;
}
const modulePath = __dirname + "/start.js";
class Orbita {
    protected windows: { [index: string]: IWindow } = {};
    public setWindows(windowsConfigs: IWindowConfig[]) {
        const newIds = windowsConfigs.map((config) => config.id);
        let currentIds = Object.keys(this.windows);
        windowsConfigs.map((config) => {
            if (!this.windows[config.id]) {
                this.addWindow(config);
            } else {
                currentIds = currentIds.filter((id) => id !== config.id);
            }
        });
        currentIds.map((id) => this.removeWindow(id));
    }
    protected addWindow(config: IWindowConfig) {
        this.windows[config.id] = {
            config,
        };
        this.startWindow(config.id);
    }
    protected startWindow(id: string) {
        const config = this.windows[id].config;
        const args = [modulePath];
        if (config.url) {
            args.push("--url=" + config.url);
        }
        if (config.module) {
            args.push("--module=" + config.module);
        }
        const child = spawn(electron as any, args, {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        child.on("close", (code) => {
            setTimeout(() => {
                this.startWindow(config.id);
            }, 1000);
        });
    }
    protected removeWindow(id: string) {
        const window = this.windows[id];
        if (window.proc) {
            window.proc.kill();
        }
        delete this.windows[id];
    }
}
export default Orbita;
