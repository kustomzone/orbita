import Window, { IWindowConfig } from "./Window";

export interface IOrbitaConfig {
    userDataDir?: string;
    proxy?: string;
}
class Orbita {
    protected windows: { [index: string]: Window } = {};
    constructor(protected config?: IOrbitaConfig) { }
    public setWindows(windowsConfigs: IWindowConfig[]) {
        let currentIds = Object.keys(this.windows);
        windowsConfigs.map((config) => {
            if (!this.windows[config.id]) {
                this.addWindow(config);
            } else {
                currentIds = currentIds.filter((id) => id !== config.id);
            }
        });
        currentIds.map((id) => this.removeWindow(id));
    }
    public get(id: string) {
        return this.windows[id];
    }
    public async destroy() {
        const promises = Object.keys(this.windows).map((id) => this.windows[id].destroy());
        this.setWindows([]);
        await Promise.all(promises);
    }
    protected addWindow(config: IWindowConfig) {
        const newConfig = Object.assign({}, this.config, config);
        this.windows[config.id] = new Window(newConfig);
        this.windows[config.id].on("close", () => {
            setTimeout(() => {
                if (this.windows[config.id]) {
                    this.windows[config.id].start();
                }
            }, 1000);
        });
        this.windows[config.id].start();
    }
    protected removeWindow(id: string) {
        const window = this.windows[id];
        window.destroy();
        delete this.windows[id];
    }
}
export default Orbita;
