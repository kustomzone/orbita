var nanoservice = require('nanoservice');
nanoservice.use("orbita-ipc-server", require('./../orbita-ipc-server'));
var Orbita = require('./../index')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
describe("Windows controller", () => {
    it("orbita", (done) => {
        var fixture1 = "dfgk6hu95et";
        var fixture2 = "testfklgjdfg";
        var fixture3 = "fixture3val";

        var orbita = Orbita({
            state: {
                test: 28,
                fix: fixture1
            },
            render: (state) => {
                console.log(state);
                return [{
                    id: state.test == 28 ? "w1" : "w2",
                    url: __dirname + "/index.html",
                    control: {
                        script: __dirname + "/control.js",
                        args: {
                            v: fixture3
                        }
                    },
                    services: [{
                        args: state.fix + state.test,
                        module: __dirname + "/service1.js",
                        transports: {
                            "tr1": {
                                "type": "orbita-ipc-client",
                                opts: {
                                    address: "addr1"
                                }
                            }
                        },
                        links: [
                            {
                                type: "in",
                                name: "in1",
                                to: "event2",
                                transport: "tr1"
                            },
                            {
                                type: "out",
                                name: "out1",
                                to: "event1",
                                transport: "tr1"
                            }
                        ]
                    }]
                }]
            }
        })

        var countIn2Event = 0;

        setTimeout(() => {
            orbita.setState({ test: fixture2 });
            var cb1;
            setTimeout(() => {
                var service1 = nanoservice({
                    in: {
                        "in1": (args) => {
                            setTimeout(() => {
                                cb1(args + fixture1);
                            }, 100);
                        },
                        "in2": (args) => {
                            expect(args).toBe(fixture2 + fixture1 + fixture1 + fixture2 + fixture3);
                            countIn2Event++;
                            if (countIn2Event == 2) {
                                done();
                            } else {
                                service1.emit("in1", fixture2);
                            }
                        }
                    },
                    out: {
                        "out1": (cb) => {
                            cb1 = cb;
                        }
                    }
                }, {
                        transports: { "t1": { "type": "orbita-ipc-server", opts: { address: "addr1", orbita: orbita } } },
                        links: [{ transport: "t1", type: "out", name: "out1", to: "event2" }, { transport: "t1", type: "in", name: "in2", to: "event1" }]
                    });
                service1.emit("in1", fixture2);
                //service1
            }, 500)
        }, 500)
    })
})