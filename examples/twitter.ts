// tslint:disable:no-console
import { sel, text, Window } from "./..";

async function start() {
    const users = [
        "PhantomJS", "ariyahidayat", "detronizator", "KDABQt", "lfranchi", "jonleighton", "_jamesmgreene", "Vitalliumm",
        // "PhantomJS"
    ];
    users.forEach(async (user) => {
        const window = new Window();
        await window.open("http://mobile.twitter.com/" + user);
        await window.waitForElement("a[href*=followers]");
        const userText =
            await window.grab(sel("a[href*=followers]>span>span>span", text()));
        console.log(user + ": " + userText);
        await window.close();
    });
}
start();
