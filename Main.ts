import { app, BrowserWindow } from "electron";
import ipcRoot = require("node-ipc");
class ElectronProcess {
    protected window: Electron.BrowserWindow;
    protected ipc: any;
    protected stopLoadingTimeoutId: NodeJS.Timer;
    protected id: number;
    protected loadPromiseResolve: null | (() => void);
    constructor(protected address: string) {
        this.id = process.pid;
    }
    public async start() {
        app.once("ready", () => {
            this.startIPC();
        });
    }
    public async startIPC() {
        const ipc = new ipcRoot.IPC();
        ipc.connectTo(this.address);
        ipc.of[this.address].on("start", () => {
            this.startWindow();
        });
        ipc.of[this.address].on("call", async ({ method, args }: any) => {
            try {
                const result = await this.callMethod(method, args);
                ipc.of[this.address].emit("MainProcessResult", { result });
            } catch (err) {
                ipc.of[this.address].emit("MainProcessResult", { err });
            }
        });
        ipc.of[this.address].emit("MainProcessStarted");
        this.ipc = ipc;
    }
    public async startWindow() {
        this.window = new BrowserWindow(defaultWindowOpts);
        this.window.webContents.openDevTools({ mode: "right" });
        // For every loaded page, send address of ipc-server
        this.window.webContents.on("did-finish-load", () => {
            this.startRenderer();
        });
        this.window.webContents.on("did-stop-loading", () => {
            this.startRenderer();
        });
        this.window.webContents.on("dom-ready", () => {
            this.startRenderer();
        });
        this.window.webContents.on("did-start-loading", () => {
            if (this.stopLoadingTimeoutId) {
                clearTimeout(this.stopLoadingTimeoutId);
            }
        });
    }
    public async callMethod(method: string, args: any) {
        switch (method) {
            case "loadURL":
                this.loadURL(args[0]);
                await new Promise<void>((resolve) => {
                    this.loadPromiseResolve = resolve;
                });
                return this.window.webContents.getURL();
            default:
                throw new Error("Invalid method " + method);
        }
    }
    public async loadURL(url: string, opts?: Electron.LoadURLOptions) {
        const newOpts = Object.assign({}, defaultUrlOpts, opts || {});
        this.window.loadURL(url, newOpts);
    }
    protected async realStartRenderer() {
        if (this.loadPromiseResolve) {
            this.loadPromiseResolve();
            this.loadPromiseResolve = null;
        }
        this.window.webContents.send("address", this.address);
    }
    protected async startRenderer() {
        if (this.stopLoadingTimeoutId) {
            clearTimeout(this.stopLoadingTimeoutId);
        }
        this.stopLoadingTimeoutId = setTimeout(() => this.realStartRenderer(), 1000);
    }
    protected log(message: string) {
        message = "ID: " + this.id + " " + message;
        this.ipc.of[this.address].emit("log", message);
    }
}
const defaultUrlOpts = {
    userAgent:
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
};
const defaultWindowOpts = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + "/preload.js",
        webSecurity: false,
    },
};

export default ElectronProcess;
