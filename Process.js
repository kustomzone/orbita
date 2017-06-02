"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const IPCRoot = require("node-ipc");
const child_process_1 = require("child_process");
const electron = require("electron");
const processPath = __dirname + "/proc.js";
class Process {
    constructor(config) {
        this.currentData = "";
        this.isDestroyed = false;
        this.currentPage = "";
        this.currentCallRendererPage = "";
        this.config = {};
        this.config = config || {};
        const ipc = new IPCRoot.IPC();
        this.address = this.generateId();
        ipc.config.id = this.address;
        ipc.config.silent = true;
        ipc.config.sync = true;
        ipc.serve();
        ipc.server.start();
        this.ipc = ipc;
        this.startElectron();
        this.ipc.server.on("log", (...args) => {
            args.pop();
            console.log.apply(console, args);
        });
        let resolveMain;
        let resolveRenderer;
        this.ipcMainReadyPromise = new Promise((resolve) => {
            resolveMain = resolve;
        });
        this.ipcRendererReadyPromise = new Promise((resolve) => {
            resolveRenderer = resolve;
        });
        this.ipc.server.on("MainProcessStarted", (_, socket) => {
            this.mainSocket = socket;
            this.ipc.server.emit(socket, "start", this.config);
            this.ipcMainReadyPromise = null;
            resolveMain();
            socket.on("close", () => {
                if (this.isDestroyed) {
                    return;
                }
                this.ipcMainReadyPromise = Promise.reject("MainProcessClosed");
            });
            socket.on("error", (err) => {
                if (this.isDestroyed) {
                    return;
                }
                this.ipcMainReadyPromise = Promise.reject(err);
            });
        });
        this.ipc.server.on("RendererProcessStarted", (_, socket) => {
            this.currentPage = this.generateId();
            resolveRenderer();
            this.rendererSocket = socket;
            this.ipcRendererReadyPromise = new Promise((resolve) => {
                resolveRenderer = resolve;
            });
            socket.on("close", () => {
                if (this.isDestroyed) {
                    return;
                }
            });
            socket.on("error", (err) => {
                if (this.isDestroyed) {
                    return;
                }
                console.error(err);
            });
        });
    }
    callMain(method, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.childReadyPromise) {
                yield this.childReadyPromise;
            }
            if (this.ipcMainReadyPromise) {
                yield this.ipcMainReadyPromise;
            }
            this.ipc.server.emit(this.mainSocket, "call", { method, args });
            return yield new Promise((resolve, reject) => {
                this.ipc.server.on("MainProcessResult", ({ err, result }) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }
    waitForNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentCallRendererPage === this.currentPage) {
                yield this.ipcRendererReadyPromise;
            }
        });
    }
    callRenderer(method, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentCallRendererPage = this.currentPage;
            if (this.childReadyPromise) {
                yield this.childReadyPromise;
            }
            if (!this.rendererSocket || !this.rendererSocket.writable) {
                yield this.ipcRendererReadyPromise;
            }
            this.ipc.server.emit(this.rendererSocket, "call", { method, args });
            return yield new Promise((resolve, reject) => {
                this.ipc.server.on("RendererProcessResult", ({ err, result }) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isDestroyed = true;
            if (this.child) {
                this.child.kill();
            }
            this.ipc.server.stop();
        });
    }
    startElectron() {
        this.child = child_process_1.spawn((this.config.runWithXvfb ? "xvfb-run -a " : "") + electron, [processPath, this.address], {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        this.child.on("error", (err) => __awaiter(this, void 0, void 0, function* () {
            if (!this.isDestroyed) {
                console.error(err);
                this.childReadyPromise = Promise.reject(err);
            }
        }));
        this.child.on("close", (code, signal) => {
            if (!this.isDestroyed) {
                console.error("close", code, signal);
                this.childReadyPromise = Promise.reject("Closed");
            }
        });
        this.childReadyPromise = null;
    }
    generateId() {
        return Math.random().toString() + (+new Date()).toString();
    }
}
exports.default = Process;
