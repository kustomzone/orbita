#!/usr/bin/env node
import { spawn } from "child_process";
import electron = require("electron");
const child = spawn(electron as any, [__dirname + "/proc.js", process.argv[2]], {
    cwd: process.cwd(),
    stdio: "inherit",
});
child.on("close", (code) => {
    process.exit(code);
});
