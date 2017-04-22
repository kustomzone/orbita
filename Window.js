"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const default_load_url_opts_1 = require("./default-load-url-opts");
class Window {
    constructor(config, window, ipcMain, ipcClient) {
        this.config = config;
        this.window = window;
        this.ipcMain = ipcMain;
        this.ipcClient = ipcClient;
        this.state = "start";
        this.page = null;
        this.oldEvents = [];
        this.window.webContents.on("will-navigate", () => {
            this.state = "start";
        });
        this.window.webContents.on("did-finish-load", () => this.newPage());
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.url) {
                this.window.loadURL(this.config.url, default_load_url_opts_1.default);
            }
        });
    }
    newPage() {
        if (this.state !== "start") {
            return;
        }
        this.state = "loading";
        const url = this.window.webContents.getURL();
        let newPage = null;
        for (const p of this.config.pages) {
            for (const match of p.matches) {
                this.ipcClient.emit("log", "reg" + match + ":" + url);
                const reg = new RegExp(match, "gi");
                if (reg.test(url)) {
                    this.ipcClient.emit("log", "hop" + match);
                    newPage = p;
                    break;
                }
            }
        }
        this.page = newPage;
        this.ipcClient.emit("log", "finish-load");
        // clear all subscribes
        this.oldEvents.map((event) => this.ipcMain.removeListener(event.name, event.func));
        this.oldEvents = [];
        if (!this.page) {
            return;
        }
        this.ipcClient.emit("log", "finish" + this.page.module);
        // Load module for page
        const events = this.page.events || [];
        // Subscribe to events
        if (events) {
            events.map((event) => {
                const that = this;
                // tslint:disable-next-line:only-arrow-functions space-before-function-paren
                const func = function (_, arg) {
                    const eventArgs = [];
                    for (let i = 1; i < arguments.length; i++) {
                        eventArgs.push(arguments[i]);
                    }
                    that.ipcClient.emit(that.page.id + "_" + event, eventArgs);
                };
                this.oldEvents.push({
                    name: event,
                    func,
                });
                this.oldEvents.map((e) => this.ipcMain.on(e.name, e.func));
            });
        }
        if (this.page.module) {
            this.ipcClient.emit("log", "load-script" + this.page.module);
            this.window.webContents.send("load-script", this.page.module, this.page.events || [], this.page.args || []);
        }
    }
}
exports.default = Window;
