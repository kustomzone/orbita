# orbita

Framework for automated web surfing with Electron for testing or crawling websites. Works as node-process.

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# Install

    npm install orbita --save
    or
    yarn add orbita

# Usage

    import { sel, Window } from "orbita";
    const window = new Window();
    async function start() {
        await window.open("http://www.google.com");
        await window.input('input[name="q"]', "github");
        await window.click("[name=btnK]");
        await window.waitForNextPage();
        const links = await window.grab(sel("div.g", [])); // grab with page-grabber module
        console.log("Number of links: " + links.length);
        await window.close();
    }
    start();

# API

## Window

    interface IWindowConfig {
        userDataDir?: string;
        proxy?: string;
        userAgent?: string;
    }
    constructor(config?: IWindowConfig);
    click(selector: string): Promise<void>;
    isVisible(selector: string): Promise<boolean>;
    waitForNextPage(): Promise<string>;
    url(): Promise<string>;
    open(url: string): Promise<string>;
    input(selector: string, text: string): Promise<void>;
    grab<T>(conf: T, context?: string): Promise<T>;
    close();

# Test

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