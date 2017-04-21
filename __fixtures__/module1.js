"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
class Module1 extends eventemitter3_1.EventEmitter {
    constructor(arg1, arg2, electron) {
        super();
        setTimeout(() => {
            this.emit("load", arg1, arg2, electron.remote.getCurrentWindow().getTitle());
        }, 100);
    }
}
exports.default = Module1;
