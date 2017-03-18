import { spawn } from "child_process";
import { BrowserWindow } from "electron";
import electron = require("electron");
interface IWindowConfig {
    id: string;
    url: string;
    module: string;
}
interface IWindow {
    browserWindow: Electron.BrowserWindow;
}
const modulePath = "";
class Orbita {
    protected windows: { [index: string]: IWindow } = {};
    constructor() {
        this.startElectron();
    }
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
    protected startElectron() {
        const args = [];
        args.unshift(modulePath);
        const child = spawn(electron as any, args, {
            cwd: process.cwd(),
            stdio: "inherit",
        })
        child.on("close", (code) => {
            setTimeout(() => {
                this.startElectron();
            }, 1000);
        });
    }
    protected addWindow(config: IWindowConfig) {
        const window = new BrowserWindow({});
        window.loadURL(config.url);
    }
    protected removeWindow(id: string) {
        this.windows[id].browserWindow.close();
        delete this.windows[id];
    }
}
