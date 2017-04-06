"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
const child_process_1 = require("child_process");
const electron = require("electron");
const ipcRoot = require("node-ipc");
const modulePath = __dirname + "/start.js";
class Orbita {
    constructor() {
        this.windows = {};
        this.id = "OrbitaIPC_" + Math.random().toString() + (+new Date()).toString();
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
    startWindow(id) {
        const config = this.windows[id].config;
        const args = [modulePath];
        if (config.url) {
            args.push("--url=" + config.url);
        }
        if (config.module) {
            args.push("--module=" + config.module);
        }
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
                this.ipc.server.on(id + "_" + event, function (ar) {
                    on[event].apply(null, ar);
                });
            });
            args.push("--events=" + events.join(","));
        }
        args.push("--id=" + this.id);
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
