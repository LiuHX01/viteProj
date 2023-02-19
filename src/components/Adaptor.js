import mitt from "mitt";

const emitter = mitt();

class DataAdaptor {
    constructor(namespace) {
        this.namespace = namespace;
    }

    DataEmitter(data) {
        emitter.emit(this.namespace, data);
    }

    DataListener(callback) {
        emitter.on(this.namespace, (data) => callback(data));
    }
}

export const GPSAdaptor = new DataAdaptor("GPSData");
export const MotionAdaptor = new DataAdaptor("MotionData");
export const LogAdaptor = new DataAdaptor("LogData");
