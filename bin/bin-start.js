#!/usr/bin/env node
var path = require('path');
var electron = require("electron");
var proc = require('child_process');
var Nanoservice = require('nanoservice');

var nanoservice = Nanoservice({
    transports: {
        "ipc-server": require("nanoservice-transport-ipc-server")
    }
});
var logAddress = "orbita" + (+new Date) + parseInt(Math.random() * 1000);
nanoservice(() => {
    return {
        log: (messages) => {
            console.log.apply(console, messages);
        }
    }
}, {
        transports: { "t": { type: "ipc-server", opts: { address: logAddress, silent: true } } },
        links: [{ transport: "t", to: "log", name: "log", type: "in" }]
    });

var args = process.argv.slice(2);
args.unshift(path.resolve(path.join(__dirname, "bin.js")));
args.push("--log-address=" + logAddress);
var child = proc.spawn(electron, args, {
    cwd: process.cwd(),
    stdio: "inherit"
})
child.on('close', function (code) {
    console.log("Orbita closed with code", code);
    setTimeout(() => {
        process.exit(code)
    }, 1000)
})
