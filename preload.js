"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
// tslint:disable-next-line:variable-name
window.___$___esw = "Loading...";
const electron_1 = require("electron");
// tslint:disable:no-console
console.log("preload");
const wrapper = (f, args) => {
    let params = [f];
    params = params.concat(args);
    return f.bind.apply(f, params);
};
// tslint:disable:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
electron_1.ipcRenderer.on("load-script", function (e, modulePath, events = [], args) {
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
        const wrapped = wrapper(module, args);
        const emitter = new wrapped();
        events.map((event) => emitter.on(event, electron_1.ipcRenderer.send.bind(electron_1.ipcRenderer, event)));
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
