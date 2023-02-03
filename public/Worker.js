onmessage = (msg) => {
    const msgData = msg.data;
    if (msgData.type == "load") {
        const cnt = msgData.info;
        console.time(`load ${cnt} files`);
        for (let i = 1; i <= cnt; i++) {
            fetch(`https://raw.githubusercontent.com/LiuHX01/DataSets/main/spd${i}.csv`)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    postMessage({
                        data: data,
                        type: "load",
                        info: i,
                    });
                    // console.log(`Loaded ${i}`);
                });
        }
        console.timeEnd(`load ${cnt} files`);
    }
};
