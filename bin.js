process.on("message", () => {
    process.send("test", "test1");
});
