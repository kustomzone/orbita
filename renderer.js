var Windows = require('./windows');
module.exports = (orbitaWindowOpts) => {
    var currentWindows = {};
    var lastNeedWindows = [];
    var renderer = function (needWindows) {
        needWindows = needWindows || lastNeedWindows;
        var ids = needWindows.map((w) => {
            if (!currentWindows.hasOwnProperty(w.id)) {
                currentWindows[w.id] = Windows.create(w, orbitaWindowOpts, ((id) => {
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
            var w = currentWindows[id];
            delete currentWindows[id];
            Windows.remove(w);
        }
    }
    return renderer;
}