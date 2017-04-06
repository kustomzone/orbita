// tslint:disable-next-line:no-reference
/// <reference path="./typings.d.ts" />
import { app, BrowserWindow, ipcMain } from "electron";
import DefaultLoadUrlOpts from "./default-load-url-opts";
import DefaultWindowOpts from "./default-window-opts";
import ipcRoot = require("node-ipc");
import program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-a --props [n]", "Arguments for instantiate module")
    .option("-u --url [n]", "Start url")
    .option("-e --events [n]", "Events for subscription")
    .option("-i --id [n]", "ID for communication")
    .option("-w --window-id [n]", "Window unique id")
    .parse(process.argv);
const events = program.events ? (program.events as string).split(",") : [];
const ipc = new ipcRoot.IPC();
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.connectTo(program.id);
const ipcClient = ipc.of[program.id];
app.once("ready", () => {
    const window = new BrowserWindow(DefaultWindowOpts);
    if (program.url) {
        window.loadURL(program.url, DefaultLoadUrlOpts);
    }
    if (program.module) {
        const args = ("" + program.props as string).split("~").map((arg) => {
            return JSON.parse(new Buffer(arg, "base64").toString("utf-8"));
        });
        window.webContents.on("did-finish-load", () => {
            window.webContents.send("load-script", program.module, events, args);
            window.webContents.openDevTools({ mode: "right" });
        });
    }
    BrowserWindow.addDevToolsExtension(__dirname + "/extension");
    if (events) {
        events.map((event) => {
            // tslint:disable-next-line:only-arrow-functions space-before-function-paren
            ipcMain.on(event, function (e, arg) {
                const eventArgs = [];
                for (let i = 1; i < arguments.length; i++) {
                    eventArgs.push(arguments[i]);
                }
                ipcClient.emit(program.windowId + "_" + event, eventArgs);
            });
        });
    }
});
