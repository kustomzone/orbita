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
// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
const electron_1 = require("electron");
const default_window_opts_1 = require("./default-window-opts");
const Window_1 = require("./Window");
const ipcRoot = require("node-ipc");
const id = process.argv[2];
const ipc = new ipcRoot.IPC();
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.connectTo(id);
const ipcClient = ipc.of[id];
ipcClient.on("start", (config) => __awaiter(this, void 0, void 0, function* () {
    if (config.userDataDir) {
        electron_1.app.setPath("userData", config.userDataDir);
    }
    // Load Orbita-panel
    electron_1.BrowserWindow.addDevToolsExtension(__dirname + "/extension");
    // Create new window with default opts
    const window = new electron_1.BrowserWindow(default_window_opts_1.default);
    // Open dev tools
    window.webContents.openDevTools({ mode: "right" });
    // Setup proxy, if exists
    if (config.proxy) {
        yield setProxy(window.webContents, config.proxy);
    }
    const pageWindow = new Window_1.default(config, window, electron_1.ipcMain, ipcClient);
    pageWindow.run();
}));
electron_1.app.once("ready", () => ipcClient.emit("inited"));
function setProxy(webContents, proxy) {
    return new Promise((resolve) => {
        webContents.session.setProxy({ proxyRules: proxy }, () => {
            resolve();
        });
    });
}
