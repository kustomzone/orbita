import ipcRoot = require("node-ipc");
import electron = require("electron");
import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
const modulePath = __dirname + "/start.js";
class Window extends EventEmitter {
    protected id: string;
    protected ipc: any;
    protected child: ChildProcess;
    constructor(protected config: IWindowConfig) {
        super();
        this.id = "OrbitaIPC_" + this.generateId();
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
    public start() {
        const config = this.config;
        const args = [modulePath, this.id];
        const child = spawn(electron as any, args, {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        child.on("close", (code) => {
            this.emit("close", "Child process closed with code " + code);
        });
        this.child = child;
        let userDataDir = "";
        if (!config.userDataDir) {
            if (this.config && this.config.userDataDir) {
                userDataDir = this.config.userDataDir;
            }
        } else {
            userDataDir = config.userDataDir;
        }
        const startConfig: IStartConfig = {
            url: config.url,
            userDataDir,
            proxy: config.proxy,
            windowId: config.id,
            pages: config.pages.map((page) => {
                const pageId = config.id + "_" + this.generateId();
                const events = Object.keys(page.on || {});
                const on = page.on || {};
                events.map((event) => {
                    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
                    this.ipc.server.on(pageId + "_" + event, function (ar: any[]) {
                        on[event].apply(null, ar);
                    });
                });
                return {
                    id: pageId,
                    matches: page.matches,
                    module: page.module,
                    args: page.args,
                    events,
                };
            }),
        };
        this.ipc.server.on("inited", () => {
            this.ipc.server.broadcast("start", startConfig);
        });
    }
    public emit(name: string, ...args: any[]) {
        this.ipc.server.broadcast("emit", {
            name,
            args,
        });
        return true;
    }
    public destroy() {
        if (this.child) {
            this.child.kill();
        }
        this.ipc.server.stop();
    }
    protected generateId() {
        return Math.random().toString() + (+new Date()).toString();
    }
}
export interface IWindowConfig {
    id: string;
    url: string;
    proxy?: string;
    userDataDir?: string;
    pages: IPageConfig[];
}
export interface IPageConfig {
    matches: string[];
    module?: string;
    args?: any[];
    on?: { [index: string]: (...args: any[]) => void };
}
export interface IStartPageConfig {
    id: string;
    matches: string[];
    module?: string;
    args?: any[];
    events?: string[];
}
export interface IStartConfig {
    windowId: string;
    url?: string;
    userDataDir?: string;
    proxy?: string;
    pages: IStartPageConfig[];
}
export default Window;
