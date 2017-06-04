import program = require("commander");
program
    .option("-a, --address <d>", "Address")
    .parse(process.argv);
import Main from "./Main";
const pr = new Main(program.address);
pr.start();
