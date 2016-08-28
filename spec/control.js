module.exports = (args, onStart, onError) => {
    window.__test = args.v;
    setTimeout(() => {
        onStart();
    }, 100)
    setTimeout(() => {
        onError("Error15");
    }, 2000)
}