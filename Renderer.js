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
const electron_1 = require("electron");
const sleep_es6_1 = require("sleep-es6");
const ipcRoot = require("node-ipc");
const Grabber = require("page-grabber");
class ElectronWindow {
    constructor() {
        this.browserWindow = electron_1.remote.getCurrentWindow();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            electron_1.ipcRenderer.once("address", (_, address) => {
                this.log("connect to", address);
                const ipc = new ipcRoot.IPC();
                ipc.connectTo(address);
                ipc.of[address].emit("RendererProcessStarted");
                ipc.of[address].on("call", ({ method, args }) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        let result;
                        switch (method) {
                            case "evaluate":
                                // tslint:disable-next-line:no-eval
                                result = eval(args[0]);
                                break;
                            case "url":
                                result = window.location.href;
                                break;
                            case "grab":
                                result = yield this.grab(args[0], args[1]);
                                break;
                            case "input":
                                result = yield this.input(args[0], args[1]);
                                break;
                            case "click":
                                result = yield this.click(args[0]);
                                break;
                            case "submit":
                                result = yield this.submit(args[0]);
                                break;
                            case "waitForElement":
                                result = !!(yield this.waitForElement(args[0], args[1]));
                                break;
                            case "isVisible":
                                result = yield this.isVisible(args[0]);
                                break;
                        }
                        ipc.of[address].emit("RendererProcessResult", { result });
                    }
                    catch (err) {
                        ipc.of[address].emit("RendererProcessResult", { err });
                    }
                }));
            });
        });
    }
    waitForElement(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            opts = opts || {};
            opts.pollingTimeout = opts.pollingTimeout || 10;
            opts.timeout = opts.timeout || 5000;
            let el;
            const startTime = +new Date();
            do {
                el = document.querySelector(selector);
                if (el) {
                    return el;
                }
                if (startTime < (+new Date()) - opts.timeout) {
                    throw new Error("Not found element by selector " + selector + " after " + opts.timeout + "ms");
                }
                yield sleep_es6_1.default(opts.pollingTimeout);
            } while (!el);
            return el;
        });
    }
    grab(conf, contextString) {
        return __awaiter(this, void 0, void 0, function* () {
            let context;
            if (contextString) {
                // tslint:disable-next-line:no-eval
                context = eval(context);
            }
            else {
                context = window.document;
            }
            return Grabber(window).grab(conf, context);
        });
    }
    click(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = yield this.waitForElement(selector, opts);
            el.click();
        });
    }
    submit(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = (yield this.waitForElement(selector, opts));
            el.submit();
        });
    }
    input(selector, text, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = (yield this.waitForElement(selector, opts));
            el.value = text;
        });
    }
    isVisible(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = yield this.waitForElement(selector, opts);
            const de = document.documentElement;
            const box = el.getBoundingClientRect();
            const top = box.top + window.pageYOffset - de.clientTop;
            const left = box.left + window.pageXOffset - de.clientLeft;
            return left > 0 || top > 0;
        });
    }
    getRectangle(el) {
        const de = document.documentElement;
        const box = el.getBoundingClientRect();
        const top = box.top + window.pageYOffset - de.clientTop;
        const left = box.left + window.pageXOffset - de.clientLeft;
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        return { left, top, width, height };
    }
    log(...args) {
        console.log.apply(console, args);
    }
}
exports.default = ElectronWindow;
