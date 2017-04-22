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
const express = require("express");
const freeport_es6_1 = require("freeport-es6");
const __1 = require("./..");
it("when set orbita windows, should open it", (done) => __awaiter(this, void 0, void 0, function* () {
    const orbita = new __1.Orbita();
    orbita.setWindows([{
            id: "1",
            url: "http://127.0.0.1:" + port + "/test.html",
            pages: [{
                    matches: ["test"],
                    module: __dirname + "/../__fixtures__/module1",
                    on: {
                        load: (arg1, arg2, title) => {
                            expect(arg1).toMatchSnapshot();
                            expect(arg2).toMatchSnapshot();
                            expect(title).toMatchSnapshot();
                        },
                    },
                    args: ["x", 1.5],
                }, {
                    matches: ["page2"],
                    module: __dirname + "/../__fixtures__/module1",
                    on: {
                        load: (arg1, arg2, title) => {
                            expect(arg1).toMatchSnapshot();
                            expect(arg2).toMatchSnapshot();
                            expect(title).toMatchSnapshot();
                            orbita.destroy();
                            done();
                        },
                    },
                    args: ["y", 2.5],
                }],
            userDataDir: __dirname + "/../tmp/userData",
        }]);
}));
let server;
let port;
beforeEach(() => __awaiter(this, void 0, void 0, function* () {
    const app = express();
    app.get("/test.html", (req, res) => {
        res.send(`<!doctype><html><title>Hello, Orbita!</title></html>`);
    });
    app.get("/page2.html", (req, res) => {
        res.send(`<!doctype><html><title>Hello, Page2!</title></html>`);
    });
    port = yield freeport_es6_1.default();
    server = yield new Promise((resolve, reject) => {
        const s = app.listen(port, () => {
            resolve(s);
        });
    });
}));
afterEach((done) => {
    server.close(done);
});
