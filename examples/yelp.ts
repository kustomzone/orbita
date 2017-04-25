// tslint:disable:no-console
import { sel, text, Window } from "./..";
const window = new Window();
async function start() {
    await window.open("http://lite.yelp.com/search?find_desc=pizza&find_loc=94040&find_submit=Search");
    const addresses = await window.grab(sel("address", text()));
    console.log("Addresses: " + addresses);
    await window.close();
}
start();
