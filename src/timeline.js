/******************************************************************************/
/*           TIMELINE                                                         */
/******************************************************************************/

// Extending the timeline object from SVG.Timeline with some helper functions

export class FlowAnimatorTimeline extends SVG.Timeline {
  constructor() {
    super();
    this.maxEndTime = 0;
    this.persist(true);
  }

  getEndTime() {
    /* /* console.log('Executing timeline.getEndTime'); */ */
    /* /* console.log(this); */ */
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

// TODO the inheritance from SVG.Timeline could probably be implemented in some better way
// Timeline for animation
// export const timeline = new SVG.Timeline().persist(true);
//
// timeline.getEndTime = function() {
//   if (timeline._runners.length > 0) {
//     return (
//       timeline._runners[timeline._runners.length - 1].start +
//       timeline._runners[timeline._runners.length - 1].runner._duration
//     );
//   } else {
//     // above statements give error if no runners added to the timeline yet -- in that case, the endTime is anyway per definition 0
//     return 0;
//   }
// };
//
// timeline.getLastAnimationStart = function() {
//   if (timeline._runners.length > 0) {
//     return timeline._runners[timeline._runners.length - 1].start;
//   } else {
//     // above statements give error if no runners added to the timeline yet -- in that case, the endTime is anyway per definition 0
//     return 0;
//   }
// };
//
// timeline.isDone = function() {
//   if (this.time() >= this.getEndTime()) {
//     return true;
//   } else {
//     return false;
//   }
// };
//
// timeline.setOnTime = onTimeHandler => {
//   timeline.on('time', onTimeHandler);
// };
