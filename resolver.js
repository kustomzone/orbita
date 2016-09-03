var path = require('path');
module.exports = (basePath, resolve) => {
    return (modulePath) => {
        var realModulePath;
        if (modulePath.substr(0, 1) !== "/" && modulePath.indexOf(":") === -1) {
            if (modulePath.substr(0, 1) === ".") {
                realModulePath = path.resolve(basePath + modulePath);                
            } else {
                realModulePath = path.resolve(basePath + "/node_modules/" + modulePath);
            }
        } else {
            realModulePath = modulePath;
        }
        try {
            realModulePath = resolve(realModulePath);
            return realModulePath;
        }
        catch (e) {
            throw new Error("Invalid resolve module path " + modulePath)
        }
    }
} 