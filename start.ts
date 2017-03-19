import { app, BrowserWindow } from "electron";
import DefaultLoadUrlOpts from "./default-load-url-opts";
import DefaultWindowOpts from "./default-window-opts";
import program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
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
});
