module.exports = () => {
    return {
        out: {
            out1: (cb) => {
                setInterval(() => {
                    cb("test1")
                }, 100)
            }
        }
    }
}