"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
const ipcRoot = require("node-ipc");
const electron = require("electron");
const child_process_1 = require("child_process");
const events_1 = require("events");
const modulePath = __dirname + "/start.js";
class Window extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
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
    start() {
        const config = this.config;
        const args = [modulePath, this.id];
        const child = child_process_1.spawn(electron, args, {
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
    emit(name, ...args) {
        this.ipc.server.broadcast("emit", {
            name,
            args,
        });
        return true;
    }
    destroy() {
        if (this.child) {
            this.child.kill();
        }
        this.ipc.server.stop();
    }
    generateId() {
        return Math.random().toString() + (+new Date()).toString();
    }
}
exports.default = Window;
