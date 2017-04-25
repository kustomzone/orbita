import express = require("express");
import freeport from "freeport-es6";
import { Server } from "http";
class TestServer {
    public port: number;
    public mainReqFn: jest.Mock<express.RequestParamHandler>;
    public server: Server;
    constructor() {
        this.mainReqFn = jest.fn() as any;
    }
    public async start() {
        this.port = await freeport();
        const app = express();
        app.use(express.static(__dirname));
        app.get("/", this.mainReqFn);
        await new Promise<Server>((resolve, reject) => {
            this.server = app.listen(this.port, (err: Error) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    public async stop() {
        await new Promise((resolve) => this.server.close(resolve));
    }
}
export default TestServer;
