#!/usr/bin/env node
var path = require('path');
var electron = require("electron-prebuilt");
var proc = require('child_process');
var args = process.argv.slice(2);
args.unshift(path.resolve(path.join(__dirname, "bin.js")));
var child = proc.spawn(electron, args, {
    cwd: process.cwd(),
    stdio: "inherit"
})
child.on('close', function (code) {
    process.exit(code)
})
