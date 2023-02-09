onmessage = (msg) => {
    const msgData = msg.data;
    if (msgData.type == "load") {
        let finished = 0;
        const cnt = msgData.info;
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
                    finished++;
                    console.log(`fetch ${i}, ${finished} finished`);
                });
        }
    }
};
