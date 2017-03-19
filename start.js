"use strict";
const electron_1 = require("electron");
const program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
    .parse(process.argv);
electron_1.app.once("ready", () => {
    const window = new electron_1.BrowserWindow();
    if (program.url) {
        window.loadURL(program.url);
    }
    if (program.module) {
    }
});
