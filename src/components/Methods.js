import { LogAdaptor } from "./Adaptor";

const sendLog = (id, eventStr) => {
    const currDate = new Date();
    const currDateStr = `${currDate.getFullYear()}-${currDate.getMonth()}-${currDate.getDate()}`;
    const currTimeStr = `${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}`;
    LogAdaptor.DataEmitter({
        id: id,
        eventStr: eventStr,
        date: currDateStr,
        time: currTimeStr,
    });
};

export { sendLog };
