/*
  Handler for managing function calls with intervals.
  Works because js all functions in js runs to completion.
*/

class IntervalHandler {
  constructor() {
    this.timers = {};
    this.counter = 0;
  }
  
  callWithInterval(f, interval) {
    /**
     * f:        function to call
     * interval: time in milliseconds
     * */
    let intervalMinutes = interval / (1000 * 60);
    let id = this.counter;

    f();

    chrome.alarms.create(id.toString(), {
        delayInMinutes: intervalMinutes, // does not allow 0 as a param
        periodInMinutes: intervalMinutes // repeat
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === id.toString()) {
            f();
        }
    });

    return this.counter++;
  }

  removeTimer(id) {
    chrome.alarms.clear(id.toString());
  }

  updateInterval(id, interval) {
    this.removeTimer(id);
    delete this.timers[id];
    return this.callWithInterval(this.timers[id], interval);
  }
}