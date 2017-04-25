import DefaultLoadUrlOpts from "./default-load-url-opts";
import { IStartConfig, IStartPageConfig } from "./Window";
type STATE = "start" | "loading" | "ready";
class Window {
    protected state: STATE = "start";
    protected page: IStartPageConfig | null = null;
    protected oldEvents: Array<{ name: string, func: any }> = [];
    constructor(
        protected config: IStartConfig,
        protected window: Electron.BrowserWindow,
        protected ipcMain: any,
        protected ipcClient: any) {
        this.window.webContents.on("will-navigate", () => {
            this.state = "start";
        });
        this.window.webContents.on("did-finish-load", () => this.newPage());
        this.ipcClient.on("emit", (opts: { name: string, args: any[] }) => {
            this.window.webContents.send("emit", opts);
        });
    }
    public async run() {
        if (this.config.url) {
            this.window.loadURL(this.config.url, DefaultLoadUrlOpts);
        }
    }
    protected newPage() {
        if (this.state !== "start") {
            return;
        }
        this.state = "loading";
        const url = this.window.webContents.getURL();
        let newPage: IStartPageConfig | null = null;
        for (const p of this.config.pages) {
            for (const match of p.matches) {
                const reg = new RegExp(match, "gi");
                if (reg.test(url)) {
                    newPage = p;
                    break;
                }
            }
        }
        this.page = newPage;
        // clear all subscribes
        this.oldEvents.map((event) => this.ipcMain.removeListener(event.name, event.func));
        this.oldEvents = [];
        if (!this.page) {
            return;
        }
        // Load module for page
        const events = this.page.events || [];
        let isReadyEvent = false;
        // Subscribe to events
        if (events) {
            events.map((event) => {
                if (event === "ready") {
                    isReadyEvent = true;
                    return;
                }
                const that = this as any;
                const func = (_: any, ...eventArgs: any[]) => {
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
            this.window.webContents.send("load-script", this.page.module, this.page.events || [], this.page.args || []);
        }
        if (isReadyEvent) {
            this.ipcClient.emit(this.page.id + "_" + "ready");
        }
    }
}
export default Window;
