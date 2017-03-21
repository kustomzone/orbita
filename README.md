# orbita

Framework for Atom/Electron with reactive windows control, inside module and communication with main process, which worked in node-process (not electron-process).

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# Install

    npm install orbita --save

# Usage
    // Main node-process
    import { Orbita } from "orbita";
    const orbita = new Orbita();
    orbita.setWindows([{
        id: "Window1", // Unique ID
        url: __dirname + "/index.html",
        module: __dirname + "/module1.js",
        on:{
            event1: (data)=>{
                console.log(data);
            }
        }
    }]);

    // module1.js (works in electron-window)
    class Module1 extends EventEmitter {
        constructor(){
            super();
            this.emit("event1", { test: "value" });
        }
    }

# API



# Test

    // TODO

    npm install
    npm test

[npm-image]: https://badge.fury.io/js/orbita.svg
[npm-url]: https://npmjs.org/package/orbita
[travis-image]: https://travis-ci.org/arvitaly/orbita.svg?branch=master
[travis-url]: https://travis-ci.org/arvitaly/orbita
[daviddm-image]: https://david-dm.org/arvitaly/orbita.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/arvitaly/orbita
[coveralls-image]: https://coveralls.io/repos/arvitaly/orbita/badge.svg
[coveralls-url]: https://coveralls.io/r/arvitaly/orbita