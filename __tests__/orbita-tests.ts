import { Server } from "http";
import express = require("express");
import freeport from "freeport-es6";
import { Orbita } from "./..";

it("when set orbita windows, should open it", async (done) => {
    const orbita = new Orbita();
    orbita.setWindows([{
        id: "1",
        url: "http://127.0.0.1:" + port + "/test.html",
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
        args: ["x", 1.5],
        userDataDir: __dirname + "/../tmp/userData",
    }]);

});
let server: Server;
let port: number;
beforeEach(async () => {
    const app = express();
    app.get("/test.html", (req, res) => {
        res.send(`<!doctype><html><title>Hello, Orbita!</title></html>`);
    });
    port = await freeport();
    server = await new Promise<Server>((resolve, reject) => {
        const s = app.listen(port, () => {
            resolve(s);
        });
    });
});
afterEach((done) => {
    server.close(done);
});
