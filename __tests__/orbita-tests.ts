import { Server } from "http";
import express = require("express");
import freeport from "freeport-es6";
import { Orbita } from "./..";

it("when set orbita windows, should open it", async (done) => {
    const orbita = new Orbita();
    await new Promise((resolve) => {
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
                        resolve();
                    },
                    finish: (params) => {
                        expect(params).toMatchSnapshot();
                        orbita.destroy();
                        done();
                    },
                },
                args: ["y", 2.5],
            }],
            userDataDir: __dirname + "/../tmp/userData",
        }]);
    });
    orbita.get("1").emit("hi", 15);
});
let server: Server;
let port: number;
beforeEach(async () => {
    const app = express();
    app.get("/test.html", (_, res) => {
        res.send(`<!doctype><html><title>Hello, Orbita!</title></html>`);
    });
    app.get("/page2.html", (_, res) => {
        res.send(`<!doctype><html><title>Hello, Page2!</title></html>`);
    });
    port = await freeport();
    server = await new Promise<Server>((resolve) => {
        const s = app.listen(port, () => {
            resolve(s);
        });
    });
});
afterEach((done) => {
    server.close(done);
});
