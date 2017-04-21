import { remote } from "electron";
const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
// tslint:disable-next-line:no-namespace
declare global {
    // tslint:disable-next-line:interface-name
    interface Window {
        ___$___esw: string;
    }
}
// tslint:disable-next-line:variable-name
window.___$___esw = "Loading...";
import { ipcRenderer } from "electron";
// tslint:disable:no-console
console.log("preload");
const wrapper = (f: any, args: any) => {
    let params = [f];
    params = params.concat(args);
    return f.bind.apply(f, params);
};
// tslint:disable:only-arrow-functions
// tslint:disable:space-before-function-paren
ipcRenderer.on("load-script", function (e, modulePath, events: string[] = [], args) {
    console.log("load-script");
    try {
        // Hack
        oldStartWith = String.prototype.startsWith;
        String.prototype.startsWith = $$$realStringStartWith;
        //
        console.log("events", events, "args", args);
        const module = (require(modulePath) as any).default;
        if (!module) {
            throw new Error("Inside module should export default class");
        }
        args.push({ remote });
        const wrapped = wrapper(module, args);
        const emitter = new wrapped();
        events.map((event) => {
            emitter.on(event, function () {
                ipcRenderer.send(event, ...arguments);
            });
        });
        // Draw dev panel
        emitter.on("panel", (data: any) => {
            window.___$___esw = JSON.stringify(data);
        });
        // Hack
        String.prototype.startsWith = oldStartWith;
        //
    } catch (e) {
        console.error(e, e.stack);
    }
});
export default {};
