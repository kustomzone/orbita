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
            out1: (cb) => {
                callback = cb;
            }
        }
    }
}