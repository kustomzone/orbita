// tslint:disable:no-console
import { sel, Window } from "./..";
const window = new Window();
async function start() {
    await window.open("http://www.google.com");
    await window.input('input[name="q"]', "github");
    await window.submit("form.tsf");
    await window.waitForNextPage();
    const links = await window.grab(sel("div.g", []));
    if (links) {
        console.log("Number of links: " + links.length);
    }
    await window.close();
}
start();
