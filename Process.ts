import makechan, { select } from "chan2";
import { Socket } from "net";
import IPCRoot = require("node-ipc");
import { ChildProcess, spawn } from "child_process";
import { IWindowConfig } from ".";
import electron = require("electron");
const processPath = __dirname + "/proc.js";
class Process {
    protected address: string;
    protected ipc: any;
    protected child: ChildProcess;
    protected config: IWindowConfig;

    protected mainSocket: Socket;
    protected rendererSocket?: Socket;

    // channels
    protected childErrorChan = makechan<Error>();
    protected mainProcessStartedChan = makechan<Socket>();
    protected mainProcessResultChan = makechan<{ err: Error; result: any; }>();
    protected rendererProcessStarted = makechan<Socket>();
    protected rendererProcessResultChan = makechan<{ err: Error; result: any; }>();
    protected mainSocketError = makechan<Error>();
    protected rendererSocketError = makechan<Error>();

    protected waitForNextPageChan = makechan();
    protected waitForNextPageResultChan = makechan();

    // calls
    protected callMainChan = makechan<{ method: string; args: any[]; }>();
    protected callRendererChan = makechan<{ method: string; args: any[]; }>();

    protected destroyedChan = makechan<void>();
    protected isDestroyed = false;

    constructor(config?: IWindowConfig) {
        this.config = config || {};
        this.address = generateId();
        this.start();
    }
    public async callMain(method: string, ...args: any[]) {
        this.callMainChan.put({ method, args });
        const { result, err } = await this.mainProcessResultChan.get();
        if (err) {
            throw err;
        }
        return result;
    }
    public async callRenderer(method: string, ...args: any[]) {
        this.callRendererChan.put({ method, args });
        const { result, err } = await this.rendererProcessResultChan.get();
        if (err) {
            throw err;
        }
        return result;
    }
    public async waitForNextPage() {
        this.waitForNextPageChan.put();
        return await this.waitForNextPageResultChan.get();
    }
    public async destroy() {
        this._destroy();
    }
    protected async start() {
        await this.createIPCServer();
        this.startElectron();
        // wait for start main process
        await select(
            this.childErrorChan.wait((err) => this.error(err)),
            this.mainProcessStartedChan.wait((socket) => {
                this.mainSocket = socket;
                this.ipc.server.emit(socket, "start", this.config);
                socket.on("close", () => {
                    this.mainSocketError.put(new Error("Main socket closed"));
                });
                socket.on("error", (err) => {
                    this.mainSocketError.put(err);
                });
            }),
        );
        let isWaitForNextPage = false;
        while (!this.isDestroyed) {
            // wait for call main or ready renderer
            while (!this.rendererSocket && !this.isDestroyed) {
                await select(
                    this.childErrorChan.wait((err) => this.error(err)),
                    this.mainSocketError.wait((err) => this.error(err)),
                    this.callMainChan.wait(({ method, args }) => this._callMain(method, args)),
                    this.rendererProcessStarted.wait((socket) => {
                        this.rendererSocket = socket;
                        socket.on("close", () => {
                            this.rendererSocket = undefined;
                            this.rendererSocketError.put(new Error("Renderer socket closed"));
                        });
                        socket.on("error", (err) => {
                            this.rendererSocket = undefined;
                            this.rendererSocketError.put(err);
                        });
                        if (isWaitForNextPage) {
                            isWaitForNextPage = false;
                            this.waitForNextPageResultChan.put();
                        }
                    }),
                );
            }
            // wait for call main, renderer or disconnect renderer
            let isRendererDisconnect = false;
            while (!isRendererDisconnect && !this.isDestroyed && !isWaitForNextPage) {
                await select(
                    this.childErrorChan.wait((err) => this.error(err)),
                    this.mainSocketError.wait((err) => this.error(err)),
                    this.rendererSocketError.wait((_) => {
                        isRendererDisconnect = true;
                    }),
                    this.callMainChan.wait(({ method, args }) => this._callMain(method, args)),
                    this.callRendererChan.wait(({ method, args }) => this._callRenderer(method, args)),
                    this.waitForNextPageChan.wait(() => {
                        this.rendererSocket = undefined;
                        isWaitForNextPage = true;
                    }),
                );
            }
        }
    }
    protected async createIPCServer() {
        const ipc = new IPCRoot.IPC();
        ipc.config.id = this.address;
        ipc.config.silent = true;
        ipc.config.sync = true;
        const promise = new Promise((resolve) => ipc.serve(resolve));
        ipc.server.start();
        this.ipc = ipc;
        this.ipc.server.on("log", (...args: any[]) => {
            args.pop();
            console.log.apply(console, args);
        });
        this.ipc.server.on("MainProcessStarted", (_: any, socket: Socket) => {
            this.mainProcessStartedChan.put(socket);
        });
        this.ipc.server.on("RendererProcessStarted", (_: any, socket: Socket) => {
            this.rendererProcessStarted.put(socket);
        });
        this.ipc.server.on("MainProcessResult", ({ err, result }: any) => {
            this.mainProcessResultChan.put({ err, result });
        });
        this.ipc.server.on("RendererProcessResult", ({ err, result }: any) => {
            this.rendererProcessResultChan.put({ err, result });
        });
        return promise;
    }
    protected _callMain(method: string, args: any[]) {
        this.ipc.server.emit(this.mainSocket, "call", { method, args });
    }
    protected _callRenderer(method: string, args: any[]) {
        this.ipc.server.emit(this.rendererSocket, "call", { method, args });
    }
    protected error(_: Error) {
        if (!this.isDestroyed) {
            this._destroy();
        }
    }
    protected _destroy() {
        this.isDestroyed = true;
        this.callMainChan.clear();
        this.callRendererChan.clear();
        if (this.ipc.server) {
            this.ipc.server.stop();
        }
        if (this.child) {
            this.child.kill();
        }
    }
    protected startElectron() {
        let runWithXvfbForUnix =
            typeof (this.config.runWithXvfbForUnix) === "undefined" ? true : this.config.runWithXvfbForUnix;
        const isWin = /^win/.test(process.platform);
        runWithXvfbForUnix = isWin ? false : runWithXvfbForUnix;
        if (runWithXvfbForUnix) {
            this.child = spawn("xvfb-run",
                ["-a", electron as any, processPath, "--address=" + this.address], {
                    cwd: process.cwd(),
                    stdio: "inherit",
                });
        } else {
            this.child = spawn(electron as any, [processPath, "--address=" + this.address], {
                cwd: process.cwd(),
                stdio: "inherit",
            });
        }
        this.child.on("error", (err) => {
            if (!this.isDestroyed) {
                this.childErrorChan.put(err);
            }
        });
        this.child.on("close", (code, signal) => {
            if (!this.isDestroyed) {
                this.childErrorChan.put(
                    new Error("Unexpected close with code " + code + " and signal " + signal));
            }
        });
    }
    protected log(...args: any[]) {
        console.log.apply(console, args);
    }
}
export default Process;
export function generateId() {
    return Math.random().toString() + (+new Date()).toString();
}
