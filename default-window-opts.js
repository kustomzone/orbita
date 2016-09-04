module.exports = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + '/preload.js'
    },
    userAgent: "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36",
    transports: {
        'orbita': require.resolve('./orbita-ipc-client')
    }
}