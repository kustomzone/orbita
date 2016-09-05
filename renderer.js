var Windows = require('./windows');
module.exports = () => {
    var currentWindows = {};
    var lastNeedWindows = [];
    var renderer = function (needWindows) {
        needWindows = needWindows || lastNeedWindows;
        var ids = needWindows.map((w) => {
            if (!currentWindows[w.id]) {
                var window = Windows.create(w);
                window.on("error", ((id) => {
                    remove(id);
                    renderer();
                }).bind(undefined, w.id))
                currentWindows[w.id] = {
                    electronWindow: window,
                    config: w
                }
            }
            return w.id;
        })
        var windowsForRemove = [];
        for (var wId in currentWindows) {
            if (ids.indexOf(wId) === -1) {
                windowsForRemove.push(wId);
            }
        }
        windowsForRemove.map((id) => {
            remove(id);
        })
        lastNeedWindows = needWindows;
        function remove(id) {
            var window = currentWindows[id];
            delete currentWindows[id];
            Windows.remove(window);
        }
    }
    return renderer;
}