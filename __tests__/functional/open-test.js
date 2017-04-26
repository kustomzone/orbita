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
const page_grabber_1 = require("page-grabber");
const TestServer_1 = require("./../../__fixtures__/TestServer");
const Window_1 = require("./../../Window");
const testServer = new TestServer_1.default();
let window;
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    window = new Window_1.default({
        userAgent: "ua",
    });
    yield testServer.start();
    yield window.open("http://127.0.0.1:" + testServer.port + "/page1.html");
}));
it("grab", () => __awaiter(this, void 0, void 0, function* () {
    expect(yield window.grab(page_grabber_1.sel("#div1", page_grabber_1.text()))).toBe("test1");
}));
it("input text", () => __awaiter(this, void 0, void 0, function* () {
    yield window.input("#input1", "Hello");
    expect(yield window.grab(page_grabber_1.sel("#input1", page_grabber_1.val()))).toBe("Hello");
}));
it("isVisible - visible", () => __awaiter(this, void 0, void 0, function* () {
    expect(yield window.isVisible("#div1")).toBe(true);
}));
it("isVisible - invisible", () => __awaiter(this, void 0, void 0, function* () {
    expect(yield window.isVisible("#invisible")).toBe(false);
}));
it("click", () => __awaiter(this, void 0, void 0, function* () {
    yield window.click("#clickable");
    expect(yield window.grab(page_grabber_1.sel("#div1", page_grabber_1.text()))).toBe("1");
}));
it("waitForNextPage", () => __awaiter(this, void 0, void 0, function* () {
    yield window.click("#link");
    const url = yield window.waitForNextPage();
    expect(url).toBe("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(yield window.grab(page_grabber_1.sel("#page2div", page_grabber_1.text()))).toBe("value2");
}));
it("open two times", () => __awaiter(this, void 0, void 0, function* () {
    const url = yield window.open("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(url).toBe("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(yield window.grab(page_grabber_1.sel("#page2div", page_grabber_1.text()))).toBe("value2");
}));
it("evaluate", () => __awaiter(this, void 0, void 0, function* () {
    yield window.open("http://127.0.0.1:" + testServer.port + "/page1.html");
    const result = yield window.evaluate("window.call1()");
    expect(result).toBe("ho1");
}));
it("user agent", () => __awaiter(this, void 0, void 0, function* () {
    expect(yield window.evaluate("navigator.userAgent")).toBe("ua");
}));
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    yield window.close();
    yield testServer.stop();
}));
