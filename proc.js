"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .option("-a, --address <d>", "Address")
    .parse(process.argv);
const Main_1 = require("./Main");
const pr = new Main_1.default(program.address);
pr.start();
