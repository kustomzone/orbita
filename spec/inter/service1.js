module.exports = () => {
    var cb;
    return {
        in: {
            in1: (data) => {
                cb(data);
            }
        },
        out: {
            out2: (cb_) => {
                cb = cb_;
            }
        }
    }
}