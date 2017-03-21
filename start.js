"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const default_load_url_opts_1 = require("./default-load-url-opts");
const default_window_opts_1 = require("./default-window-opts");
const ipcRoot = require("node-ipc");
const program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
    .option("-e --events [n]", "Events for subscription")
    .option("-i --id [n]", "ID for communication")
    .parse(process.argv);
electron_1.app.once("ready", () => {
    const window = new electron_1.BrowserWindow(default_window_opts_1.default);
    if (program.url) {
        window.loadURL(program.url, default_load_url_opts_1.default);
    }
    if (program.module) {
        window.webContents.on("did-finish-load", () => {
            window.webContents.send("load-script", program.module);
            window.webContents.openDevTools({ mode: "right" });
        });
    }
    if (program.events) {
        const ipc = new ipcRoot.IPC();
        ipc.config.retry = 1500;
        ipc.config.silent = false;
        ipc.connectTo(program.id);
        program.events.split(",").map((event) => {
            electron_1.ipcMain.on(event, (e, arg) => {
                const eventArgs = [];
                for (let i = 1; i < arguments.length; i++) {
                    eventArgs.push(arguments[i]);
                }
                ipc.of[program.id].emit(event, eventArgs);
            });
        });
    }
});
