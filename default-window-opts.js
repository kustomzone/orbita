"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + "/preload.js",
        webSecurity: false,
    },
};
