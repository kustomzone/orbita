"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
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
electron_1.ipcRenderer.on("load-script", function (e, modulePath, events = []) {
    console.log("load-script");
    try {
        // Hack
        oldStartWith = String.prototype.startsWith;
        String.prototype.startsWith = $$$realStringStartWith;
        //
        const args = [];
        for (let i = 3; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        console.log("events", events, "args", args);
        const wrapped = wrapper(require(modulePath).default, args);
        const emitter = new wrapped();
        events.map((event) => emitter.on(event, electron_1.ipcRenderer.send.bind(electron_1.ipcRenderer, event)));
        // Hack
        String.prototype.startsWith = oldStartWith;
        //
    }
    catch (e) {
        console.error(e, e.stack);
    }
});
exports.default = {};
