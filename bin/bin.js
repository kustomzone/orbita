/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var program = require('commander');
var resolve = require('resolve-module-path');
program
    .version('0.0.1')
    .option('-m --main [type]', "Orbita-component file")
    .option('-c, --config-file [type]', 'NanoService configuration file')
    .option('-p, --base-path [type]', 'Base path for all')
    .parse(process.argv);
var config;
var basePath;
if (program.basePath) {
    basePath = program.basePath;
} else {
    basePath = process.cwd();
}
if (program.configFile) {
    config = require(resolve(program.configFile, {
        basePath: basePath
    }));
}
var main
if (program.main) {
    main = resolve(program.main, {
        basePath: basePath
    });
}
var orbita = require('./../index')({ runAsGlobal: true });
if (!main) {
    main = resolve('./', {
        basePath: basePath
    })
}
console.log("Orbita start with module ", main);
var component = require(main);
Promise.resolve(typeof (component) === "function" ? component(config) : component).then((component) => {
    global.orbita = orbita(component);
}).catch((err) => {
    console.error(err);
})