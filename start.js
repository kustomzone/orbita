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
const default_load_url_opts_1 = require("./default-load-url-opts");
const default_window_opts_1 = require("./default-window-opts");
const ipcRoot = require("node-ipc");
const program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-a --props [n]", "Arguments for instantiate module")
    .option("-u --url [n]", "Start url")
    .option("-e --events [n]", "Events for subscription")
    .option("-i --id [n]", "ID for communication")
    .option("-p --proxy [n]", "Proxy")
    .option("-d --user-data-dir [n]", "UserData directory for electron")
    .option("-w --window-id [n]", "Window unique id")
    .parse(process.argv);
const events = program.events ? program.events.split(",") : [];
const ipc = new ipcRoot.IPC();
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.connectTo(program.id);
const ipcClient = ipc.of[program.id];
if (program.userDataDir) {
    electron_1.app.setPath("userData", program.userDataDir);
}
electron_1.app.once("ready", () => {
    const window = new electron_1.BrowserWindow(default_window_opts_1.default);
    if (program.proxy) {
        window.webContents.session.setProxy({ proxyRules: "127.0.0.1:8111" }, () => {
            afterProxy();
        });
    }
    else {
        afterProxy();
    }
    electron_1.BrowserWindow.addDevToolsExtension(__dirname + "/extension");
    window.webContents.openDevTools({ mode: "right" });
    function afterProxy() {
        return __awaiter(this, void 0, void 0, function* () {
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            if (program.url) {
                window.loadURL(program.url, default_load_url_opts_1.default);
            }
            if (program.module) {
                const args = program.props.replace(/"/gi, "") ? ("" + program.props).split("~").map((arg) => {
                    return JSON.parse(new Buffer(arg, "base64").toString("utf-8"));
                }) : [];
                window.webContents.once("did-finish-load", () => {
                    window.webContents.send("load-script", program.module, events, args);
                });
            }
            if (events) {
                events.map((event) => {
                    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
                    electron_1.ipcMain.on(event, function (e, arg) {
                        const eventArgs = [];
                        for (let i = 1; i < arguments.length; i++) {
                            eventArgs.push(arguments[i]);
                        }
                        ipcClient.emit(program.windowId + "_" + event, eventArgs);
                    });
                });
            }
        });
    }
});
