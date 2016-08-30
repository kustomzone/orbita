var orbita = require('./../index');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000
describe("Inter service communication", () => {
    it("simple", (done) => {
        var orbTransport = { type: "orbita", opts: { address: "addr1" } };
        var count = 0;
        orbita({
            state: {},
            render: () => {
                return [{
                    id: "w15",
                    url: __dirname + "/inter/index.html",
                    services: [{
                        module: __dirname + "/inter/service1.js",
                        transports: { t1: orbTransport },
                        links: [{ type: "in", name: "in1", to: "event1", transport: "t1" }],
                        on: {
                            out2: (data) => {
                                expect(data).toBe("test1");
                                count++;
                                if (count > 3) {
                                    done();
                                }
                            }
                        }
                    }, {
                            module: __dirname + "/inter/service2.js",
                            transports: { t1: orbTransport },
                            links: [{ type: "out", name: "out1", to: "event1", transport: "t1" }]
                        }]
                }]
            }
        })
    })
})