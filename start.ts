import { app, BrowserWindow } from "electron";
import program = require("commander");
program
    .option("-m --module [n]", "Inside module")
    .option("-u --url [n]", "Start url")
    .parse(process.argv);

app.once("ready", () => {
    const window = new BrowserWindow();
    if (program.url) {
        window.loadURL(program.url);
    }
    if (program.module) {
        
    }
});
