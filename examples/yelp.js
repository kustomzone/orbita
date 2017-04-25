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
const window = new __1.Window();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield window.open("http://lite.yelp.com/search?find_desc=pizza&find_loc=94040&find_submit=Search");
        const addresses = yield window.grab(__1.sel("address", __1.text()));
        console.log("Addresses: " + addresses);
        yield window.close();
    });
}
start();
