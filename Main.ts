import { app, BrowserWindow, session } from "electron";
import ipcRoot = require("node-ipc");
import { IWindowConfig } from ".";
class ElectronProcess {
    protected config: IWindowConfig;
    protected window: Electron.BrowserWindow;
    protected ipc: any;
    protected stopLoadingTimeoutId: NodeJS.Timer;
    protected id: number;
    protected loadPromiseResolve: null | (() => void);
    protected lastBeforeSendCallback: any;
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
        ipc.of[this.address].on("start", (config: IWindowConfig = {}) => {
            this.config = config;
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
        if (this.config.userDataDir) {
            app.setPath("userData", this.config.userDataDir);
        }
        this.window = new BrowserWindow(defaultWindowOpts);
        if (this.config.proxy) {
            await this.setProxy(this.window.webContents, this.config.proxy);
        }
        this.window.webContents.on("destroyed", () => {
            this.ipc.of[this.address].emit("log", "destroyed");
        });
        this.window.webContents.on("crashed", () => {
            this.ipc.of[this.address].emit("log", "crashed");
        });

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
    public async setProxy(webContents: Electron.WebContents, proxy: string) {
        return new Promise((resolve) => {
            webContents.session.setProxy({ proxyRules: proxy } as any, () => {
                resolve();
            });
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
            case "beforeSendHeaders":
                const filter = args[0];
                const defaultSession = session.defaultSession;
                if (!defaultSession) {
                    throw new Error("Session not exists");
                }
                return await new Promise((resolve) => {
                    defaultSession.webRequest.onBeforeSendHeaders(filter, (details: any, cb: any) => {
                        this.lastBeforeSendCallback = cb;
                        resolve(details);
                    });
                });
            case "resolveBeforeSendHeaders":
                const res = args[0];
                this.lastBeforeSendCallback(res);
                return;
            default:
                throw new Error("Invalid method " + method);
        }
    }
    public async loadURL(url: string, opts?: Electron.LoadURLOptions) {
        const newOpts = Object.assign({},
            defaultUrlOpts,
            this.config.userAgent ? { userAgent: this.config.userAgent } : {},
            opts || {});
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
