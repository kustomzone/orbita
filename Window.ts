import sleep from "sleep-es6";
import { IClickOpts, ICommandOpts, IInputOpts, IWaitForElementOpts, IWindowConfig } from ".";
import Process from "./Process";
class Window {
    protected process: Process;
    constructor(config?: IWindowConfig) {
        this.process = new Process(config);
    }
    public async evaluate(code: string) {
        return this.process.callRenderer("evaluate", code);
    }
    public async waitForElement(selector: string, opts?: IWaitForElementOpts): Promise<void> {
        return this.process.callRenderer("waitForElement", selector, opts);
    }
    public async click(selector: string, opts?: IClickOpts): Promise<void> {
        return this.process.callRenderer("click", selector, opts);
    }
    public async submit(selector: string, opts?: IWaitForElementOpts): Promise<void> {
        return this.process.callRenderer("submit", selector, opts);
    }
    public async isVisible(selector: string, opts?: IWaitForElementOpts): Promise<boolean> {
        return this.process.callRenderer("isVisible", selector, opts);
    }
    public async beforeSendHeaders(
        urls: string[],
        cb: (details: {
            id: number;
            method: string;
            referrer: string;
            resourceType: string;
            requestHeaders: { [index: string]: string };
            timestamp: number;
            url: string;
        }) => {
                cancel: boolean, requestHeaders?: {
                    [index: string]: string;
                };
            }): Promise<void> {
        const details = await this.process.callMain("beforeSendHeaders", urls);
        await this.process.callMain("resolveBeforeSendHeaders", cb(details));
    }
    public async waitForNextPage(opts?: ICommandOpts): Promise<string> {
        const newOpts = opts || {};
        newOpts.timeout = newOpts.timeout || 10000;
        await Promise.race([this.process.waitForNextPage(), sleep(newOpts.timeout).then(() =>
            Promise.reject("Not loading next page for timeout " + newOpts.timeout))]);
        return this.url();
    }
    public async url(): Promise<string> {
        return this.process.callRenderer("url");
    }
    public async open(url: string): Promise<string> {
        return this.process.callMain("loadURL", url);
    }
    public async input(selector: string, text: string, opts?: IInputOpts) {
        return this.process.callRenderer("input", selector, text, opts);
    }
    public async grab<T>(conf: T, context?: string): Promise<T> {
        return this.process.callRenderer("grab", conf, context);
    }
    public async startRecordModel<T>(conf: T, context?: string, opts?: { pollingTimeout: number }): Promise<void> {
        return this.process.callRenderer("startRecordModel", conf, context, opts);
    }
    public async getNextData(): Promise<any> {
        return this.process.callRenderer("getNextData");
    }
    public async close() {
        this.process.destroy();
    }
}
export default Window;
