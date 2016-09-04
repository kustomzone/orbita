var Windows = require('./windows');
module.exports = () => {
    var currentWindows = {};
    var renderer = function (needWindows) {
        var ids = [];
        if (needWindows) {
            ids = needWindows.map((w) => {
                if (!currentWindows[w.id]) {
                    currentWindows[w.id] = {
                        electronWindow: Windows.create(w),
                        config: w
                    }
                }
                return w.id;
            })
        }
        var windowsForRemove = []
        for (var wId in currentWindows) {
            if (ids.indexOf(wId) === -1) {
                windowsForRemove.push(wId);
            }
        }
        windowsForRemove.map((id) => {
            var windowConfig = currentWindows[id].config;
            delete currentWindows[id];
            Windows.remove(windowConfig);
        })
    }
    return renderer;
}