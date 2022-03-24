import throttle from "lodash.throttle";

const createScheduleGC = (interval: number) => throttle(() => {
  if (global.gc) {
    global.gc();
  }
}, interval);

export default createScheduleGC;
