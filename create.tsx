import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jsdom from 'jsdom';
import { app } from 'electron';
let isReady = false;
app.on("ready", () => {
    isReady = true;
})
app.on('window-all-closed', () => {
    //app.quit()
})
let cb = (c) => {
    if (isReady) {
        c();
    } else {
        app.on("ready", () => {
            c();
        })
    }
}
export default (el: React.ReactElement<any>) => {
    jsdom.env(`<html><body><div id="root"></div></body></html>`, (err, window) => {
        if (err) {
            throw err;
        }
        global['window'] = window;
        global['document'] = window.document;
        global['Event'] = window['Event'];
        cb(() => {
            ReactDOM.render(el, window.document.getElementById("root"))
        })
    })
}