module.exports = {
    opts: {
        transports: {
            ic: "nanoservice-transport-ipc-server",
            is: "nanoservice-transport-ipc-client",
        }
    },
    render: (state) => {
        return [{
            url: __dirname + "/test.html",
            services: [{
                module: __dirname + "/service1.js",
                transports: { t1: { type: "is", opts: { address: "addr1" } } },
                links: [{ type: "in", name: "in1", to: "event1", transport: "t1" }]

            }, {
                    module: __dirname + "/service2.js",
                    transports: { t1: { type: "ic", opts: { address: "addr1" } } },
                    links: [{ type: "out", name: "out1", to: "event1", transport: "t1" }]
                }]
        }]
    }
}