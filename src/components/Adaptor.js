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

const GPSAdaptor = new DataAdaptor("GPSData");
const MotionAdaptor = new DataAdaptor("MotionData");
const LogAdaptor = new DataAdaptor("LogData");

export { GPSAdaptor, MotionAdaptor, LogAdaptor };
