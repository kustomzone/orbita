// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
import { ChildProcess, spawn } from "child_process";
import { BrowserWindow } from "electron";
import electron = require("electron");
import ipcRoot = require("node-ipc");
export interface IWindowConfig {
    id: string;
    url: string;
    module?: string;
    proxy?: string;
    userDataDir?: string;
    args?: any[];
    on?: { [index: string]: (...args: any[]) => void };
}
export interface IOrbitaConfig {
    userDataDir?: string;
}
interface IWindow {
    proc?: ChildProcess;
    config: IWindowConfig;
}
const modulePath = __dirname + "/start.js";
class Orbita {
    protected windows: { [index: string]: IWindow } = {};
    protected id: string;
    protected ipc: any;
    constructor(protected config?: IOrbitaConfig) {
        this.id = "OrbitaIPC_" + Math.random().toString() + (+new Date()).toString();
        const ipc = new ipcRoot.IPC();
        ipc.config.retry = 1500;
        ipc.config.id = this.id;
        ipc.config.silent = true;
        ipc.serve(null);
        ipc.server.start();
        ipc.server.on("log", (...args: any[]) => {
            args.pop();
            console.log.apply(console, args);
        });
        this.ipc = ipc;
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
    public destroy() {
        this.setWindows([]);
        this.ipc.server.stop();
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
        if (config.proxy) {
            args.push("--proxy=" + config.proxy);
        }
        let userDataDir = "";
        if (!config.userDataDir) {
            if (this.config && this.config.userDataDir) {
                userDataDir = this.config.userDataDir;
            }
        } else {
            userDataDir = config.userDataDir;
        }
        if (userDataDir) {
            args.push("--user-data-dir=" + userDataDir);
        }
        args.push("--window-id=" + id);
        if (config.args) {
            args.push("--props=\"" + config.args.map((arg) => {
                return new Buffer(JSON.stringify(arg)).toString("base64");
            }).join("~") + "\"");
        }
        const on = config.on;
        if (on) {
            const events = Object.keys(config.on);
            events.map((event) => {
                // tslint:disable-next-line:only-arrow-functions space-before-function-paren
                this.ipc.server.on(id + "_" + event, function (ar: any[]) {
                    on[event].apply(null, ar);
                });
            });
            args.push("--events=" + events.join(","));
        }
        args.push("--id=" + this.id);
        const child = spawn(electron as any, args, {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        child.on("close", (code) => {
            setTimeout(() => {
                if (this.windows[config.id]) {
                    this.startWindow(config.id);
                }
            }, 1000);
        });
        this.windows[id].proc = child;
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
