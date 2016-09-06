var orbita = require('./..')({ runAsGlobal: true });
var module = process.argv[2];
if (!module) {
    var pp = process.cwd() + "/package.json";
    var mainM
    try {
        mainM = require.resolve(pp)
    } catch (e) {
        mainM = null;
    }

    if (mainM) {
        module = require(mainM).main;
    }
    if (!module) {
        module = process.cwd() + "/index.js";
    } else {
        module = process.cwd() + "/" + module;
    }
} else {
    module = require('path').resolve(module);
}
console.log("Orbita start with module ", module);
var component = require(module);
Promise.resolve(typeof (component) === "function" ? component() : component).then((component) => {
    orbita.runAsGlobal = true;
    orbita(component);
}).catch((err) => {
    console.error(err);
})
