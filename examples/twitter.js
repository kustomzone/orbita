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
// tslint:disable:no-console
const __1 = require("./..");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = [
            "PhantomJS", "ariyahidayat", "detronizator", "KDABQt", "lfranchi", "jonleighton", "_jamesmgreene", "Vitalliumm",
        ];
        users.forEach((user) => __awaiter(this, void 0, void 0, function* () {
            const window = new __1.Window();
            yield window.open("http://mobile.twitter.com/" + user);
            yield window.waitForElement("a[href*=followers]");
            const userText = yield window.grab(__1.sel("a[href*=followers]>span>span>span", __1.text()));
            console.log(user + ": " + userText);
            yield window.close();
        }));
    });
}
start();
