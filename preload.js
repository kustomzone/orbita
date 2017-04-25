"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
// tslint:disable-next-line:variable-name
window.___$___esw = "Loading...";
const electron_2 = require("electron");
// tslint:disable:no-console
console.log("preload");
const wrapper = (f, args) => {
    let params = [f];
    params = params.concat(args);
    return f.bind.apply(f, params);
};
electron_2.ipcRenderer.on("load-script", (_, modulePath, events = [], args) => {
    console.log("load-script");
    try {
        // Hack
        oldStartWith = String.prototype.startsWith;
        String.prototype.startsWith = $$$realStringStartWith;
        //
        console.log("events", events, "args", args);
        const module = require(modulePath).default;
        if (!module) {
            throw new Error("Inside module should export default class");
        }
        args.push({ remote: electron_1.remote });
        const wrapped = wrapper(module, args);
        const emitter = new wrapped();
        events.map((event) => {
            emitter.on(event, (...eventArgs) => {
                electron_2.ipcRenderer.send(event, ...eventArgs);
            });
        });
        electron_2.ipcRenderer.on("emit", (__, opts) => {
            emitter.emit(opts.name, ...opts.args);
        });
        // Draw dev panel
        emitter.on("panel", (data) => {
            window.___$___esw = JSON.stringify(data);
        });
        // Hack
        String.prototype.startsWith = oldStartWith;
        //
    }
    catch (e) {
        console.error(e, e.stack);
    }
});
exports.default = {};
