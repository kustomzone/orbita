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
const sleep_es6_1 = require("sleep-es6");
const Process_1 = require("./Process");
class Window {
    constructor(config) {
        this.process = new Process_1.default(config);
    }
    evaluate(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("evaluate", code);
        });
    }
    waitForElement(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("waitForElement", selector, opts);
        });
    }
    click(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("click", selector, opts);
        });
    }
    submit(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("submit", selector, opts);
        });
    }
    isVisible(selector, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("isVisible", selector, opts);
        });
    }
    waitForNextPage(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const newOpts = opts || {};
            newOpts.timeout = newOpts.timeout || 10000;
            yield Promise.race([this.process.waitForNextPage(), sleep_es6_1.default(newOpts.timeout).then(() => Promise.reject("Not loading next page for timeout " + newOpts.timeout))]);
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
    input(selector, text, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.process.callRenderer("input", selector, text, opts);
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
