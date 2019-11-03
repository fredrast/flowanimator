/**
 * @file src/timeline.js
 * @description Defines the {@link FlowAnimatorTimeline} class, which extends
 * the Timeline class from SVG.js with some helper functions
 */

/******************************************************************************/
/*           TIMELINE                                                         */
/******************************************************************************/

/**
 * @constructor FlowAnimatorTimeline
 * @extends SVG.Timeline
 * @description Extends the timeline object from SVG.Timeline with some helper functions
 */
export class FlowAnimatorTimeline extends SVG.Timeline {
  constructor() {
    super();
    this.maxEndTime = 0;
    this.persist(true);
  }

  getEndTime() {
    /* console.log('Executing timeline.getEndTime'); */
    /* console.log(this); */
    if (this._runners.length > 0) {
      const lastRunnerEndTime =
        this._runners[this._runners.length - 1].start +
        this._runners[this._runners.length - 1].runner._duration;
      if (lastRunnerEndTime > this.maxEndTime) {
        this.maxEndTime = lastRunnerEndTime;
      }
    }
    return this.maxEndTime;
  }

  getLastAnimationStart() {
    if (this._runners.length > 0) {
      return this._runners[this._runners.length - 1].start;
    } else {
      // above statements give error if no runners added to the timeline yet -- in that case, the endTime is anyway per definition 0
      return 0;
    }
  }

  isDone() {
    if (this.time() >= this.getEndTime()) {
      return true;
    } else {
      return false;
    }
  }

  setOnTime(onTimeHandler) {
    this.on('time', onTimeHandler);
  }
}
