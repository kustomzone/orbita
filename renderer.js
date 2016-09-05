var Windows = require('./windows');
module.exports = () => {
    var currentWindows = {};
    var lastNeedWindows = [];
    var renderer = function (needWindows) {
        needWindows = needWindows || lastNeedWindows;
        var ids = needWindows.map((w) => {
            if (!currentWindows.hasOwnProperty(w.id)) {
                currentWindows[w.id] = Windows.create(w, ((id) => {
                    remove(id);
                    renderer();
                }).bind(undefined, w.id));
            }
            return w.id;
        });
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