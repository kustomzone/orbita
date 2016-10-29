"use strict";
var electron = require("electron-prebuilt");
const child_process_1 = require('child_process');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (modulePath, args) => {
    args = args || [];
    args.unshift(modulePath);
    let child = child_process_1.spawn(electron, args, {
        cwd: process.cwd(),
        stdio: "inherit"
    });
    child.on('close', function (code) {
        process.exit(code);
    });
};
