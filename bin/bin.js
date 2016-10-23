/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var program = require('commander');
var resolve = require('resolve-module-path');
program
    .version('0.0.1')
    .option('-m --main [type]', "Orbita-component file")
    .option('-c, --config-file [type]', 'NanoService configuration file')
    .option('-p, --base-path [type]', 'Base path for all')
    .option('-l, --log-address [type]', 'IPC log address')
    .parse(process.argv);
var Nanoservice = require('nanoservice');
var nanoservice = Nanoservice({
    transports: {
        "ipc-client": require("nanoservice-transport-ipc-client")
    }
});
var log;
nanoservice((config) => {
    log = function () {
        config.out("log", [].slice.apply(arguments));
    }
}, {
        transports: { "t": { type: "ipc-client", opts: { address: program.logAddress } } },
        links: [{ transport: "t", to: "log", name: "log", type: "out" }]
    });
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
var orbita = require('./../index')({ runAsGlobal: true, log: log });
if (!main) {
    main = resolve('./', {
        basePath: basePath
    })
}
log("Orbita start with module ", main);
var component = require(main);
Promise.resolve(typeof (component) === "function" ? component(config) : component).then((component) => {
    global.orbita = orbita(component);
    global.orbita.log = log;
}).catch((err) => {
    console.error(err);
})