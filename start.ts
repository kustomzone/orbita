import { app, BrowserWindow, ipcMain } from "electron";
import DefaultLoadUrlOpts from "./default-load-url-opts";
import DefaultWindowOpts from "./default-window-opts";
import ipcRoot = require("node-ipc");
import program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
    .option("-e --events [n]", "Events for subscription")
    .option("-i --id [n]", "ID for communication")
    .parse(process.argv);
app.once("ready", () => {
    const window = new BrowserWindow(DefaultWindowOpts);
    if (program.url) {
        window.loadURL(program.url, DefaultLoadUrlOpts);
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

        (program.events as string).split(",").map((event) => {
            ipcMain.on(event, (e, arg) => {
                const eventArgs = [];
                for (let i = 1; i < arguments.length; i++) {
                    eventArgs.push(arguments[i]);
                }
                ipc.of[program.id].emit(event, eventArgs);
            });
        });
    }
});
