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
class TestServer {
    constructor() {
        this.mainReqFn = jest.fn();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.port = yield freeport_es6_1.default();
            const app = express();
            app.use(express.static(__dirname));
            app.get("/", this.mainReqFn);
            yield new Promise((resolve, reject) => {
                this.server = app.listen(this.port, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => this.server.close(resolve));
        });
    }
}
exports.default = TestServer;
