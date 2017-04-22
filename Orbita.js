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
const Window_1 = require("./Window");
class Orbita {
    constructor(config) {
        this.config = config;
        this.windows = {};
    }
    setWindows(windowsConfigs) {
        let currentIds = Object.keys(this.windows);
        windowsConfigs.map((config) => {
            if (!this.windows[config.id]) {
                this.addWindow(config);
            }
            else {
                currentIds = currentIds.filter((id) => id !== config.id);
            }
        });
        currentIds.map((id) => this.removeWindow(id));
    }
    get(id) {
        return this.windows[id];
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = Object.keys(this.windows).map((id) => this.windows[id].destroy());
            this.setWindows([]);
            yield Promise.all(promises);
        });
    }
    addWindow(config) {
        this.windows[config.id] = new Window_1.default(config);
        this.windows[config.id].on("close", () => {
            setTimeout(() => {
                if (this.windows[config.id]) {
                    this.windows[config.id].start();
                }
            }, 1000);
        });
        this.windows[config.id].start();
    }
    removeWindow(id) {
        const window = this.windows[id];
        window.destroy();
        delete this.windows[id];
    }
}
exports.default = Orbita;
