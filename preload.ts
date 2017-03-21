const $$$realStringStartWith = String.prototype.startsWith;
let oldStartWith;
import { ipcRenderer } from "electron";
// tslint:disable:no-console
console.log("preload");
const wrapper = (f: any, args: any) => {
    let params = [f];
    params = params.concat(args);
    return f.bind.apply(f, params);
};
// tslint:disable:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
ipcRenderer.on("load-script", function (e, modulePath, events: string[] = []) {
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
        const wrapped = wrapper((require(modulePath) as any).default, args);
        const emitter = new wrapped();
        events.map((event) => emitter.on(event, ipcRenderer.send.bind(ipcRenderer, event)));
        // Hack
        String.prototype.startsWith = oldStartWith;
        //
    } catch (e) {
        console.error(e, e.stack);
    }
});
export default {};
