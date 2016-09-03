var _ = require('lodash');
function createWindow(windowConfig, windowsOpts) {
    var window = {
        id: windowConfig.id,
        electronWindow: null
    }
    var opts = _.extend({
        transports: {}
    }, windowConfig.opts, windowsOpts);

    return window;
}
function removeWindow() {

}
module.exports = {
    createWindow: createWindow,
    removeWindow: removeWindow
}