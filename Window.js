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
const Process_1 = require("./Process");
class Window {
    constructor(config) {
        this.process = new Process_1.default(config);
    }
    waitForElement(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("waitForElement", selector);
        });
    }
    click(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("click", selector);
        });
    }
    submit(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("submit", selector);
        });
    }
    isVisible(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("isVisible", selector);
        });
    }
    waitForNextPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.process.waitForNextPage();
            return this.url();
        });
    }
    url() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("url");
        });
    }
    open(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callMain("loadURL", url);
        });
    }
    input(selector, text) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("input", selector, text);
        });
    }
    grab(conf, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("grab", conf, context);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.process.destroy();
        });
    }
}
exports.default = Window;
