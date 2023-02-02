class MyWorker {
    constructor() {
        this.worker = new Worker("/Worker.js");
    }

    sendMsg(data, type) {
        this.worker.postMessage({
            data: data,
            type: type,
        });
    }

    onMsg(callback) {
        this.worker.onmessage = (e) => {
            callback(e.data);
        };
    }
}

export const myWorker = new MyWorker();
