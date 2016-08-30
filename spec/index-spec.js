var nanoservice = require('nanoservice');
nanoservice.use("orbita-ipc-server", require('./../orbita-ipc-server'));

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
describe("Orbita", () => {
    it("complex", (done) => {
        var fixture1 = "fixture1val";
        var fixture2 = "fixture2val";
        var fixture3 = "fixture3val";

        var orbita = global['Orbita1'];



        var countIn2Event = 0;

        var cb1;
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

        global["ORBITASERVICE1"] = service1;


        orbita.setState({
            test: 28,
            countWindowCall: 0,
            fix: fixture1,
            fixture2: fixture2,
            fixture3: fixture3
        });

    })

})