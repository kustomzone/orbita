module.exports = (args) => {
    window.__test = args.v;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 100)
    })
}