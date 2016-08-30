var orbTransport = { type: "internal", opts: { address: "addr1" } }
module.exports = {
    opts: {
        transports: {
            internal: "nanoservice-transport-internal"
        }
    },
    render: (state) => {
        return [{
            url: __dirname + "/test.html",
            services: [{
                module: __dirname + "/service1.js",
                transports: { t1: orbTransport },
                links: [{ type: "in", name: "in1", to: "event1", transport: "t1" }]

            }, {
                    module: __dirname + "/service2.js",
                    transports: { t1: orbTransport },
                    links: [{ type: "out", name: "out1", to: "event1", transport: "t1" }]
                }]
        }]
    }
}