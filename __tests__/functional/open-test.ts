import { sel, text, val } from "page-grabber";
import TestServer from "./../../__fixtures__/TestServer";
import Window from "./../../Window";
const testServer = new TestServer();
let window: Window;
beforeAll(async () => {
    window = new Window({
        userAgent: "ua",
    });
    await testServer.start();
    await window.open("http://127.0.0.1:" + testServer.port + "/page1.html");
});
it("grab", async () => {
    expect(await window.grab(sel("#div1", text()))).toBe("test1");
});
it("input text", async () => {
    await window.input("#input1", "Hello");
    expect(await window.grab(sel("#input1", val()))).toBe("Hello");
});
it("isVisible - visible", async () => {
    expect(await window.isVisible("#div1")).toBe(true);
});
it("isVisible - invisible", async () => {
    expect(await window.isVisible("#invisible")).toBe(false);
});
it("click", async () => {
    await window.click("#clickable");
    expect(await window.grab(sel("#div1", text()))).toBe("1");
});
it("waitForNextPage", async () => {
    await window.click("#link");
    const url = await window.waitForNextPage();
    expect(url).toBe("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(await window.grab(sel("#page2div", text()))).toBe("value2");
});
it("open two times", async () => {
    const url = await window.open("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(url).toBe("http://127.0.0.1:" + testServer.port + "/page2.html");
    expect(await window.grab(sel("#page2div", text()))).toBe("value2");
});
it("evaluate", async () => {
    await window.open("http://127.0.0.1:" + testServer.port + "/page1.html");
    const result = await window.evaluate("window.call1()");
    expect(result).toBe("ho1");
});
it("user agent", async () => {
    expect(await window.evaluate("navigator.userAgent")).toBe("ua");
});
afterAll(async () => {
    await window.close();
    await testServer.stop();
});
