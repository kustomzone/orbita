module.exports = (args, onStart, onError) => {
    window.__test = args.v;
    setTimeout(() => {
        onStart();
        console.log("window started")
    }, 100)
    setTimeout(() => {
        //onError("Error15");
    }, 2000)
}