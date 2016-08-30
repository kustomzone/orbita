module.exports = () => {
    return {
        render: (state) => {
            console.log(state);
            return [{
                id: state.test == 28 ? "w1" : "w2",
                url: __dirname + "/index.html",
                control: {
                    script: __dirname + "/control.js",
                    args: {
                        v: state.fixture3
                    }
                },
                services: [{
                    args: state.fix + state.test,
                    module: __dirname + "/service1.js",
                    on: {
                        firstOut: function () {
                            console.log("FIRSTOUT", this)
                            this.setState((state) => {
                                if (state.countWindowCall > 0) {
                                    global["ORBITASERVICE1"].emit("in1", state.fixture2);
                                }
                                return { test: state.fixture2, countWindowCall: state.countWindowCall + 1 }
                            })

                        }
                    },
                    transports: {
                        "tr1": {
                            "type": "orbita",
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
    }
}