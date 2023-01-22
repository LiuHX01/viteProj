onmessage = async (msg) => {
    if (msg.data == "load") {
        fetch("/newFishs/fishdatashort.csv")
            .then((response) => response.text())
            .then((data) => {
                postMessage(data);
                console.log("Worker: Message posted to main script");
            });
    }
};
