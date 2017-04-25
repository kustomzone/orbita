import { app, BrowserWindow, ipcMain } from "electron";

import DefaultWindowOpts from "./default-window-opts";
import Window from "./ElectronWindow";
import { IStartConfig } from "./Window";
import ipcRoot = require("node-ipc");
const id = process.argv[2];
const ipc = new ipcRoot.IPC();
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.connectTo(id);
const ipcClient = ipc.of[id];

ipcClient.on("start", async (config: IStartConfig) => {
    if (config.userDataDir) {
        app.setPath("userData", config.userDataDir);
    }
    // Load Orbita-panel
    BrowserWindow.addDevToolsExtension(__dirname + "/extension");
    // Create new window with default opts
    const window = new BrowserWindow(DefaultWindowOpts);
    // Open dev tools
    window.webContents.openDevTools({ mode: "right" });
    // Setup proxy, if exists
    if (config.proxy) {
        await setProxy(window.webContents, config.proxy);
    }
    const pageWindow = new Window(config, window, ipcMain, ipcClient);
    pageWindow.run();
});
app.once("ready", () => ipcClient.emit("inited"));

function setProxy(webContents: Electron.WebContents, proxy: string) {
    return new Promise((resolve) => {
        webContents.session.setProxy({ proxyRules: proxy } as any, () => {
            resolve();
        });
    });
}
