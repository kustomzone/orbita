import { ipcRenderer, remote } from "electron";
import sleep from "sleep-es6";
import ipcRoot = require("node-ipc");
import Grabber = require("page-grabber");
export interface IWaitForElementOpts {
    pollingTimeout: number;
    failTimeout: number;
}
class ElectronWindow {
    protected browserWindow: Electron.BrowserWindow;
    constructor() {
        this.browserWindow = remote.getCurrentWindow();
    }
    public async start() {
        ipcRenderer.once("address", (_, address) => {
            this.log("connect to", address);
            const ipc = new ipcRoot.IPC();
            ipc.connectTo(address);
            ipc.of[address].emit("RendererProcessStarted");
            ipc.of[address].on("call", async ({ method, args }: any) => {
                try {
                    let result: any;
                    switch (method) {
                        case "url":
                            result = window.location.href;
                            break;
                        case "grab":
                            result = await this.grab(args[0], args[1]);
                            break;
                        case "input":
                            result = await this.input(args[0], args[1]);
                            break;
                        case "click":
                            result = await this.click(args[0]);
                            break;
                        case "submit":
                            result = await this.submit(args[0]);
                            break;
                        case "waitForElement":
                            result = !!(await this.waitForElement(args[0]));
                            break;
                        case "isVisible":
                            result = await this.isVisible(args[0]);
                            break;
                    }
                    ipc.of[address].emit("RendererProcessResult", { result });
                } catch (err) {
                    ipc.of[address].emit("RendererProcessResult", { err });
                }
            });
        });
    }
    public async waitForElement(
        selector: string,
        opts?: {[P in keyof IWaitForElementOpts]?: IWaitForElementOpts[P]}): Promise<HTMLElement> {
        opts = opts || {};
        opts.pollingTimeout = opts.pollingTimeout || 10;
        opts.failTimeout = opts.failTimeout || 5000;
        let el: HTMLElement | null;
        const startTime = + new Date();
        do {
            el = document.querySelector(selector) as HTMLElement;
            if (el) {
                return el;
            }
            if (startTime < (+new Date()) - opts.failTimeout) {
                throw new Error("Not found element by selector " + selector + " after " + opts.failTimeout + "ms");
            }
            await sleep(opts.pollingTimeout);
        } while (!el);
        return el;
    }
    public async grab(conf: any, contextString?: string) {
        let context: any;
        if (contextString) {
            // tslint:disable-next-line:no-eval
            context = eval(context);
        } else {
            context = window.document;
        }
        return Grabber(window).grab(conf, context);
    }
    public async click(selector: string) {
        const el = await this.waitForElement(selector);
        el.click();
    }
    public async submit(selector: string) {
        const el = (await this.waitForElement(selector)) as HTMLFormElement;
        el.submit();
    }
    public async input(selector: string, text: string) {
        const el = (await this.waitForElement(selector)) as HTMLInputElement;
        el.value = text;
    }
    public async isVisible(selector: string) {
        const el = await this.waitForElement(selector);
        const de = document.documentElement;
        const box = el.getBoundingClientRect();
        const top = box.top + window.pageYOffset - de.clientTop;
        const left = box.left + window.pageXOffset - de.clientLeft;
        return left > 0 || top > 0;
    }
    public getRectangle(el: HTMLElement) {
        const de = document.documentElement;
        const box = el.getBoundingClientRect();
        const top = box.top + window.pageYOffset - de.clientTop;
        const left = box.left + window.pageXOffset - de.clientLeft;
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        return { left, top, width, height };
    }
    protected log(...args: any[]) {
        console.log.apply(console, args);
    }
}
export default ElectronWindow;
