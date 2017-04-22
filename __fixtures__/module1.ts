import { remote } from "electron";
import { EventEmitter } from "eventemitter3";
class Module1 extends EventEmitter {
    constructor(arg1: any, arg2: any, electron: { remote: typeof remote }) {
        super();
        setTimeout(() => {
            this.emit("load", arg1, arg2, electron.remote.getCurrentWindow().getTitle());
            if (window.location.href.indexOf("page2") === -1) {
                window.location.href = "/page2.html";
            }
        }, 100);
    }
}
export default Module1;
