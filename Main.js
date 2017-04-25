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
const electron_1 = require("electron");
const ipcRoot = require("node-ipc");
class ElectronProcess {
    constructor(address) {
        this.address = address;
        this.id = process.pid;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            electron_1.app.once("ready", () => {
                this.startIPC();
            });
        });
    }
    startIPC() {
        return __awaiter(this, void 0, void 0, function* () {
            const ipc = new ipcRoot.IPC();
            ipc.connectTo(this.address);
            ipc.of[this.address].on("start", () => {
                this.startWindow();
            });
            ipc.of[this.address].on("call", ({ method, args }) => {
                try {
                    const result = this.callMethod(method, args);
                    ipc.of[this.address].emit("MainProcessResult", { result });
                }
                catch (err) {
                    ipc.of[this.address].emit("MainProcessResult", { err });
                }
            });
            ipc.of[this.address].emit("MainProcessStarted");
            this.ipc = ipc;
        });
    }
    startWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            this.window = new electron_1.BrowserWindow(defaultWindowOpts);
            this.window.webContents.openDevTools({ mode: "right" });
            // For every loaded page, send address of ipc-server
            this.window.webContents.on("did-finish-load", () => {
                this.startRenderer();
            });
            this.window.webContents.on("did-stop-loading", () => {
                this.startRenderer();
            });
            this.window.webContents.on("dom-ready", () => {
                this.startRenderer();
            });
            this.window.webContents.on("did-start-loading", () => {
                if (this.stopLoadingTimeoutId) {
                    clearTimeout(this.stopLoadingTimeoutId);
                }
            });
        });
    }
    callMethod(method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (method) {
                case "loadURL":
                    this.loadURL(args[0]);
                    this.window.webContents.once("did-finish-load", () => {
                        return this.window.webContents.getURL();
                    });
                    break;
            }
        });
    }
    loadURL(url, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const newOpts = Object.assign({}, defaultUrlOpts, opts || {});
            this.window.loadURL(url, newOpts);
        });
    }
    realStartRenderer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.window.webContents.send("address", this.address);
        });
    }
    startRenderer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stopLoadingTimeoutId) {
                clearTimeout(this.stopLoadingTimeoutId);
            }
            this.stopLoadingTimeoutId = setTimeout(() => this.realStartRenderer(), 1000);
        });
    }
    log(message) {
        message = "ID: " + this.id + " " + message;
        this.ipc.of[this.address].emit("log", message);
    }
}
const defaultUrlOpts = {
    userAgent: "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
};
const defaultWindowOpts = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + "/preload.js",
        webSecurity: false,
    },
};
exports.default = ElectronProcess;
