"use strict";
const electron_1 = require("electron");
const default_load_url_opts_1 = require("./default-load-url-opts");
const default_window_opts_1 = require("./default-window-opts");
const program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
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
});
