"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
class Module1 extends eventemitter3_1.EventEmitter {
    constructor(arg1, arg2, electron) {
        super();
        setTimeout(() => {
            this.emit("load", arg1, arg2, electron.remote.getCurrentWindow().getTitle());
            if (window.location.href.indexOf("page2") === -1) {
                window.location.href = "/page2.html";
            }
        }, 100);
    }
}
exports.default = Module1;
