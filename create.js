"use strict";
const ReactDOM = require('react-dom');
const jsdom = require('jsdom');
const electron_1 = require('electron');
let isReady = false;
electron_1.app.on("ready", () => {
    isReady = true;
});
electron_1.app.on('window-all-closed', () => {
    //app.quit()
});
let cb = (c) => {
    if (isReady) {
        c();
    }
    else {
        electron_1.app.on("ready", () => {
            c();
        });
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (el) => {
    jsdom.env(`<html><body><div id="root"></div></body></html>`, (err, window) => {
        if (err) {
            throw err;
        }
        global['window'] = window;
        global['document'] = window.document;
        global['Event'] = window['Event'];
        cb(() => {
            ReactDOM.render(el, window.document.getElementById("root"));
        });
    });
};
