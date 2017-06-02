import { Socket } from "net";
import IPCRoot = require("node-ipc");
import { ChildProcess, spawn } from "child_process";
import { IWindowConfig } from ".";
import electron = require("electron");
const processPath = __dirname + "/proc.js";
class Process {
    protected address: string;
    protected child: ChildProcess;
    protected currentData = "";
    protected ipc: any;
    protected isDestroyed = false;
    protected childReadyPromise: Promise<void> | null;
    protected ipcMainReadyPromise: Promise<void> | null;
    protected ipcRendererReadyPromise: Promise<void> | null;
    protected mainSocket: Socket;
    protected rendererSocket: Socket;
    protected currentPage: string = "";
    protected currentCallRendererPage = "";
    protected config: IWindowConfig = {};
    constructor(config?: IWindowConfig) {
        this.config = config || {};
        const ipc = new IPCRoot.IPC();
        this.address = this.generateId();
        ipc.config.id = this.address;
        ipc.config.silent = true;
        ipc.config.sync = true;
        ipc.serve();
        ipc.server.start();
        this.ipc = ipc;
        this.startElectron();
        this.ipc.server.on("log", (...args: any[]) => {
            args.pop();
            console.log.apply(console, args);
        });
        let resolveMain: () => void;
        let resolveRenderer: () => void;
        this.ipcMainReadyPromise = new Promise<void>((resolve) => {
            resolveMain = resolve;
        });
        this.ipcRendererReadyPromise = new Promise<void>((resolve) => {
            resolveRenderer = resolve;
        });
        this.ipc.server.on("MainProcessStarted", (_: any, socket: Socket) => {
            this.mainSocket = socket;
            this.ipc.server.emit(socket, "start", this.config);
            this.ipcMainReadyPromise = null;
            resolveMain();
            socket.on("close", () => {
                if (this.isDestroyed) {
                    return;
                }
                this.ipcMainReadyPromise = Promise.reject("MainProcessClosed");
            });
            socket.on("error", (err) => {
                if (this.isDestroyed) {
                    return;
                }
                this.ipcMainReadyPromise = Promise.reject(err);
            });
        });

        this.ipc.server.on("RendererProcessStarted", (_: any, socket: Socket) => {
            this.currentPage = this.generateId();
            resolveRenderer();
            this.rendererSocket = socket;
            this.ipcRendererReadyPromise = new Promise<void>((resolve) => {
                resolveRenderer = resolve;
            });
            socket.on("close", () => {
                if (this.isDestroyed) {
                    return;
                }
            });
            socket.on("error", (err) => {
                if (this.isDestroyed) {
                    return;
                }
                console.error(err);
            });
        });
    }
    public async callMain(method: string, ...args: any[]) {
        if (this.childReadyPromise) {
            await this.childReadyPromise;
        }
        if (this.ipcMainReadyPromise) {
            await this.ipcMainReadyPromise;
        }
        this.ipc.server.emit(this.mainSocket, "call", { method, args });
        return await new Promise<any>((resolve, reject) => {
            this.ipc.server.on("MainProcessResult", ({ err, result }: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }
    public async waitForNextPage() {
        if (this.currentCallRendererPage === this.currentPage) {
            await this.ipcRendererReadyPromise;
        }
    }
    public async callRenderer(method: string, ...args: any[]) {
        this.currentCallRendererPage = this.currentPage;
        if (this.childReadyPromise) {
            await this.childReadyPromise;
        }
        if (!this.rendererSocket || !this.rendererSocket.writable) {
            await this.ipcRendererReadyPromise;
        }
        this.ipc.server.emit(this.rendererSocket, "call", { method, args });
        return await new Promise<any>((resolve, reject) => {
            this.ipc.server.on("RendererProcessResult", ({ err, result }: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }
    public async destroy() {
        this.isDestroyed = true;
        if (this.child) {
            this.child.kill();
        }
        this.ipc.server.stop();
    }
    protected startElectron() {
        const runWithXvfbForUnix =
            typeof (this.config.runWithXvfbForUnix) === "undefined" ? true : this.config.runWithXvfbForUnix;
        this.child = spawn((runWithXvfbForUnix ? "xvfb-run -a " : "") + electron as any,
            [processPath, this.address], {
                cwd: process.cwd(),
                stdio: "inherit",
            });
        this.child.on("error", async (err) => {
            if (!this.isDestroyed) {
                console.error(err);
                this.childReadyPromise = Promise.reject(err);
            }
        });
        this.child.on("close", (code, signal) => {
            if (!this.isDestroyed) {
                console.error("close", code, signal);
                this.childReadyPromise = Promise.reject("Closed");
            }
        });
        this.childReadyPromise = null;
    }
    protected generateId() {
        return Math.random().toString() + (+new Date()).toString();
    }
}
export default Process;
