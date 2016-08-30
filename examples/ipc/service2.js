module.exports = (args) => {
    return {
        out: {
            out1: (cb) => {
                setInterval(() => {
                    cb("test1")
                }, 1000)
            }
        }
    }
}