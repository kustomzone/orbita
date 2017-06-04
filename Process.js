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
const chan2_1 = require("chan2");
const IPCRoot = require("node-ipc");
const child_process_1 = require("child_process");
const electron = require("electron");
const processPath = __dirname + "/proc.js";
class Process {
    constructor(config) {
        // channels
        this.childErrorChan = chan2_1.default();
        this.mainProcessStartedChan = chan2_1.default();
        this.mainProcessResultChan = chan2_1.default();
        this.rendererProcessStarted = chan2_1.default();
        this.rendererProcessResultChan = chan2_1.default();
        this.mainSocketError = chan2_1.default();
        this.rendererSocketError = chan2_1.default();
        this.waitForNextPageChan = chan2_1.default();
        this.waitForNextPageResultChan = chan2_1.default();
        // calls
        this.callMainChan = chan2_1.default();
        this.callRendererChan = chan2_1.default();
        this.destroyedChan = chan2_1.default();
        this.isDestroyed = false;
        this.config = config || {};
        this.address = generateId();
        this.start();
    }
    callMain(method, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.callMainChan.put({ method, args });
            const { result, err } = yield this.mainProcessResultChan.get();
            if (err) {
                throw err;
            }
            return result;
        });
    }
    callRenderer(method, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.callRendererChan.put({ method, args });
            const { result, err } = yield this.rendererProcessResultChan.get();
            if (err) {
                throw err;
            }
            return result;
        });
    }
    waitForNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.waitForNextPageChan.put();
            return yield this.waitForNextPageResultChan.get();
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this._destroy();
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.createIPCServer();
            this.startElectron();
            // wait for start main process
            yield chan2_1.select(this.childErrorChan.wait((err) => this.error(err)), this.mainProcessStartedChan.wait((socket) => {
                this.mainSocket = socket;
                this.ipc.server.emit(socket, "start", this.config);
                socket.on("close", () => {
                    this.mainSocketError.put(new Error("Main socket closed"));
                });
                socket.on("error", (err) => {
                    this.mainSocketError.put(err);
                });
            }));
            let isWaitForNextPage = false;
            while (!this.isDestroyed) {
                // wait for call main or ready renderer
                while (!this.rendererSocket && !this.isDestroyed) {
                    yield chan2_1.select(this.childErrorChan.wait((err) => this.error(err)), this.mainSocketError.wait((err) => this.error(err)), this.callMainChan.wait(({ method, args }) => this._callMain(method, args)), this.rendererProcessStarted.wait((socket) => {
                        this.rendererSocket = socket;
                        socket.on("close", () => {
                            this.rendererSocket = undefined;
                            this.rendererSocketError.put(new Error("Renderer socket closed"));
                        });
                        socket.on("error", (err) => {
                            this.rendererSocket = undefined;
                            this.rendererSocketError.put(err);
                        });
                        if (isWaitForNextPage) {
                            isWaitForNextPage = false;
                            this.waitForNextPageResultChan.put();
                        }
                    }));
                }
                // wait for call main, renderer or disconnect renderer
                let isRendererDisconnect = false;
                while (!isRendererDisconnect && !this.isDestroyed && !isWaitForNextPage) {
                    yield chan2_1.select(this.childErrorChan.wait((err) => this.error(err)), this.mainSocketError.wait((err) => this.error(err)), this.rendererSocketError.wait((_) => {
                        isRendererDisconnect = true;
                    }), this.callMainChan.wait(({ method, args }) => this._callMain(method, args)), this.callRendererChan.wait(({ method, args }) => this._callRenderer(method, args)), this.waitForNextPageChan.wait(() => {
                        this.rendererSocket = undefined;
                        isWaitForNextPage = true;
                    }));
                }
            }
        });
    }
    createIPCServer() {
        const ipc = new IPCRoot.IPC();
        ipc.config.id = this.address;
        ipc.config.silent = true;
        ipc.config.sync = true;
        ipc.serve();
        ipc.server.start();
        this.ipc = ipc;
        this.ipc.server.on("log", (...args) => {
            args.pop();
            console.log.apply(console, args);
        });
        this.ipc.server.on("MainProcessStarted", (_, socket) => {
            this.mainProcessStartedChan.put(socket);
        });
        this.ipc.server.on("RendererProcessStarted", (_, socket) => {
            this.rendererProcessStarted.put(socket);
        });
        this.ipc.server.on("MainProcessResult", ({ err, result }) => {
            this.mainProcessResultChan.put({ err, result });
        });
        this.ipc.server.on("RendererProcessResult", ({ err, result }) => {
            this.rendererProcessResultChan.put({ err, result });
        });
    }
    _callMain(method, args) {
        this.ipc.server.emit(this.mainSocket, "call", { method, args });
    }
    _callRenderer(method, args) {
        this.ipc.server.emit(this.rendererSocket, "call", { method, args });
    }
    error(_) {
        if (!this.isDestroyed) {
            this._destroy();
        }
    }
    _destroy() {
        this.isDestroyed = true;
        this.callMainChan.clear();
        this.callRendererChan.clear();
        this.ipc.server.stop();
        if (this.child) {
            this.child.kill();
        }
    }
    startElectron() {
        let runWithXvfbForUnix = typeof (this.config.runWithXvfbForUnix) === "undefined" ? true : this.config.runWithXvfbForUnix;
        const isWin = /^win/.test(process.platform);
        runWithXvfbForUnix = isWin ? false : runWithXvfbForUnix;
        if (runWithXvfbForUnix) {
            this.child = child_process_1.spawn("xvfb-run", ["-a", electron, processPath, "--address=" + this.address], {
                cwd: process.cwd(),
                stdio: "inherit",
            });
        }
        else {
            this.child = child_process_1.spawn(electron, [processPath, "--address=" + this.address], {
                cwd: process.cwd(),
                stdio: "inherit",
            });
        }
        this.child.on("error", (err) => {
            if (!this.isDestroyed) {
                this.childErrorChan.put(err);
            }
        });
        this.child.on("close", (code, signal) => {
            if (!this.isDestroyed) {
                this.childErrorChan.put(new Error("Unexpected close with code " + code + " and signal " + signal));
            }
        });
    }
    log(...args) {
        console.log.apply(console, args);
    }
}
exports.default = Process;
function generateId() {
    return Math.random().toString() + (+new Date()).toString();
}
exports.generateId = generateId;
