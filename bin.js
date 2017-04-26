#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const electron = require("electron");
const child = child_process_1.spawn(electron, [__dirname + "/proc.js", process.argv[2]], {
    cwd: process.cwd(),
    stdio: "inherit",
});
child.on("close", (code) => {
    process.exit(code);
});
