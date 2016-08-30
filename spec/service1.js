module.exports = (args) => {
    var callback;
    return {
        in: {
            in1: (data) => {
                console.log("service in1 event", data);
                setTimeout(() => {
                    callback(data + args + window.__test);
                }, 50)
            }
        },
        out: {
            firstOut: (cb) => {
                console.log("SUBSCRIBE firstOut")
                setTimeout(() => {
                    cb();
                }, 100)
            },
            out1: (cb) => {
                console.log("SUBSCRIBE out1")
                callback = cb;
            }
        }
    }
}