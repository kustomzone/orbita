"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
const child_process_1 = require("child_process");
const electron = require("electron");
const ipcRoot = require("node-ipc");
const modulePath = __dirname + "/start.js";
class Orbita {
    constructor(config) {
        this.config = config;
        this.windows = {};
        this.id = "OrbitaIPC_" + this.generateId();
        const ipc = new ipcRoot.IPC();
        ipc.config.retry = 1500;
        ipc.config.id = this.id;
        ipc.config.silent = true;
        ipc.serve(null);
        ipc.server.start();
        ipc.server.on("log", (...args) => {
            args.pop();
            console.log.apply(console, args);
        });
        this.ipc = ipc;
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
    destroy() {
        this.setWindows([]);
        this.ipc.server.stop();
    }
    addWindow(config) {
        this.windows[config.id] = {
            config,
        };
        this.startWindow(config.id);
    }
    generateId() {
        return Math.random().toString() + (+new Date()).toString();
    }
    startWindow(id) {
        const config = this.windows[id].config;
        const args = [modulePath, this.id];
        const child = child_process_1.spawn(electron, args, {
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
        let userDataDir = "";
        if (!config.userDataDir) {
            if (this.config && this.config.userDataDir) {
                userDataDir = this.config.userDataDir;
            }
        }
        else {
            userDataDir = config.userDataDir;
        }
        const startConfig = {
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
                    this.ipc.server.on(pageId + "_" + event, function (ar) {
                        on[event].apply(null, ar);
                    });
                });
                args.push("--events=" + events.join(","));
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
    removeWindow(id) {
        const window = this.windows[id];
        if (window.proc) {
            window.proc.kill();
        }
        delete this.windows[id];
    }
}
exports.default = Orbita;
