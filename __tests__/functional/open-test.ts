import { sel, text, val } from "page-grabber";
import sleep from "sleep-es6";
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
it("url", async () => {
    expect(await window.url()).toBe("http://127.0.0.1:" + testServer.port + "/page1.html");
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
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 10000;
it("evaluate 2 windows", async () => {
    await window.open("http://127.0.0.1:" + testServer.port + "/page1.html");
    const window2 = new Window();
    await window2.open("http://127.0.0.1:" + testServer.port + "/page1.html");
    const results = await Promise.all([window2.evaluate("window.call1()")]);
    expect(results).toEqual(["ho1"]);
    await window2.close();

});
it("subscribe", async () => {
    await window.open("http://127.0.0.1:" + testServer.port + "/page3.html");
    await window.startRecordModel({ value: sel("#div1", text()) }, "window", { pollingTimeout: 50 });
    await sleep(500);
    const lastValue = (await window.getNextData());
    expect(lastValue.value > 10).toBeTruthy();
    await sleep(500);
    expect((await window.getNextData()).value + 10 > lastValue.value).toBeTruthy();
});
afterAll(async () => {
    await window.close();
    await testServer.stop();
});
