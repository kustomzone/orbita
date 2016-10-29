var electron: any = require("electron-prebuilt");
import { spawn } from 'child_process';
export default (modulePath, args?) => {
    args = args || [];
    args.unshift(modulePath);
    let child = spawn(electron, args, {
        cwd: process.cwd(),
        stdio: "inherit"
    })    
    child.on('close', function (code) {
        process.exit(code)
    })
}