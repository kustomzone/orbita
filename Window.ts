import { IWindowConfig } from ".";
import Process from "./Process";
class Window {
    protected process: Process;
    constructor(config?: IWindowConfig) {
        this.process = new Process(config);
    }
    public async waitForElement(selector: string): Promise<void> {
        return this.process.callRenderer("waitForElement", selector);
    }
    public async click(selector: string): Promise<void> {
        return this.process.callRenderer("click", selector);
    }
    public async submit(selector: string): Promise<void> {
        return this.process.callRenderer("submit", selector);
    }
    public async isVisible(selector: string): Promise<boolean> {
        return this.process.callRenderer("isVisible", selector);
    }
    public async waitForNextPage(): Promise<string> {
        await this.process.waitForNextPage();
        return this.url();
    }
    public async url(): Promise<string> {
        return this.process.callRenderer("url");
    }
    public async open(url: string): Promise<string> {
        return this.process.callMain("loadURL", url);
    }
    public async input(selector: string, text: string) {
        return this.process.callRenderer("input", selector, text);
    }
    public async grab<T>(conf: T, context?: string): Promise<T> {
        return this.process.callRenderer("grab", conf, context);
    }
    public async close() {
        this.process.destroy();
    }
}
export default Window;
