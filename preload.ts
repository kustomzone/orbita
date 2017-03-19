const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
import { ipcRenderer } from "electron";
// tslint:disable:no-console
console.log("preload");
ipcRenderer.on("load-script", (e, modulePath) => {
    console.log("load-script");
    try {
        // Hack
        oldStartWith = String.prototype.startsWith;
        String.prototype.startsWith = $$$realStringStartWith;
        //
        const args = [];
        for (let i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        console.log(args);
        (require(modulePath) as any).default.apply(this, args);
        // Hack
        String.prototype.startsWith = oldStartWith;
        //
    } catch (e) {
        console.error(e, e.stack);
    }
});
export default {};
