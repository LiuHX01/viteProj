class MyWorker {
    constructor() {
        this.worker = new Worker(new URL("./Worker.js", import.meta.url));
    }

    sendMsg(data, type, info = null) {
        console.log("Sending message to worker: ", data, type, info);
        this.worker.postMessage({
            data: data,
            type: type,
            info: info,
        });
    }

    onMsg(callback) {
        this.worker.onmessage = (e) => {
            callback(e.data);
        };
    }
}

export const myWorker = new MyWorker();
