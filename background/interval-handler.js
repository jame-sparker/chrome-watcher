/*
  Handler for managing function calls with intervals.
  Works because js all functions in js runs to completion.
*/

class IntervalHandler {
  constructor() {
    this.timers = {};
  }
  
  callWithInterval(f, interval) {
    /**
     * f:        function to call
     * interval: time in milliseconds
     * */
    let instance = this;

    function _inner() {
      f();
      instance.timers[f] = setTimeout(_inner, interval);
    }
    _inner();
  }

  removeTimer(f) {
    clearTimeout(this.timers[f]);
    delete this.timers[f];
  }

  updateInterval(f, interval) {
    this.removeTimer(f);
    this.callWithInterval(f, interval);
  }
}