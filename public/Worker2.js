onmessage = (unsorted) => {
    /*
        unsorted.data: {
            feature: "speed",
            msg: {...}
        }
    */
    console.log(unsorted.data["feature"]);
    postMessage({
        feature: unsorted.data["feature"],
        msg: unsorted.data["msg"].sort((a, b) => a[unsorted.data["feature"]] - b[unsorted.data["feature"]]),
    });
};
