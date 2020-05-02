/**
 * @file src/timeline.js
 * @description TODO
 */

// const OVERLAP_TIME = 100;

export function Move(
  story,
  type,
  start,
  duration,
  fromColumn,
  toColumn,
  fromSlot,
  toSlot
) {
  this.story = story;
  this.type = type;
  this.id = story.id;
  this.start = start;
  this.duration = duration;
  this.end = start + duration; // TODO: end and duration redundant
  this.fromColumn = fromColumn;
  this.toColumn = toColumn;
  this.fromSlot = fromSlot;
  this.toSlot = toSlot;
}

// Move.prototype.moveTokenToPositionAtAnimationMoment = function(
//   animationMoment
// ) {
//   const progressFactor = Math.min(
//     Math.max(animationMoment - this.start, 0) / this.duration,
//     1
//   );
//
//   this.story.moveToken(
//     this.fromColumn,
//     this.fromSlot,
//     this.toColumn,
//     this.toSlot,
//     progressFactor
//   );
//   this.story.setTokenVisibility(this.toColumn.visible);
// };

function TimelineEvent(time, progress, timelineDone) {
  this.time = time;
  this.progress = progress;
  this.timelineDone = timelineDone;
}

export function Timeline() {
  const INITIAL_INTERVAL = 15;

  this.movesInAscendingOrder = [];
  this.movesInDescendingOrder = [];
  const interval = INITIAL_INTERVAL;
  // this.moves = [];
  this.time = 0;
  this.previousTime = 0;
  this.endTime = 0;
  // this.onTimeHandler = {};
  this.playing = false;

  this.addMove = (
    story,
    type,
    start,
    duration,
    fromColumn,
    toColumn,
    fromSlot,
    toSlot
  ) => {
    const move = new Move(
      story,
      type,
      start,
      duration,
      fromColumn,
      toColumn,
      fromSlot,
      toSlot
    );
    // this.moves.push(move);
    this.movesInAscendingOrder.push(move);
    this.movesInDescendingOrder.unshift(move);
    story.addMove(start, duration, fromColumn, toColumn, fromSlot, toSlot); // TODO: no longer necessary?
    this.endTime = Math.max(start + duration, this.endTime);
  };

  /* this.updateTokensAtAnimationMoment = animationMoment => {
    const movesActiveAtAnimationMoment = moves.filter(move => {
      return (
        move.start <= animationMoment &&
        move.start + move.duration >= animationMoment - OVERLAP_TIME
      );
    });

    movesActiveAtAnimationMoment.forEach(move => {
      move.moveTokenToPositionAtAnimationMoment(animationMoment);
    });
  };*/

  this.setEventHandler = eventHandler => {
    this.eventHandler = eventHandler;
  };

  const executeInterval = (functionToExecute, delay, keepGoing, whenDone) => {
    if (keepGoing()) {
      functionToExecute().then(response => {
        if (!response.animationDone) {
          setTimeout(
            () =>
              executeInterval(functionToExecute, delay, keepGoing, whenDone),
            delay
          );
        } else {
          whenDone();
        }
      });
    }
  };

  this.play = () => {
    this.playing = true;
    executeInterval(
      timelineTick,
      interval,
      shouldAnimationContinue,
      animationCompleted
    );
  };

  const timelineTick = async () => {
    this.processTimelineEvent();
    this.previousTime = this.time;
    this.time += interval;
    const animationDone = this.time > this.endTime;
    return { animationDone: animationDone };
  };

  const shouldAnimationContinue = () => {
    return this.playing;
  };

  const animationCompleted = () => {
    this.processTimelineEvent();
    this.playing = false;
    this.previousTime = this.time;
    this.time = 0;
  };

  this.pause = () => {
    this.playing = false;
  };

  this.stop = () => {
    this.playing = false;
    this.time = 0;
    this.previousTime = 0;
    this.processTimelineEvent();
  };

  this.processTimelineEvent = () => {
    const selectedMoves = {};

    if (this.time > this.previousTime) {
      for (let i = 0; i < this.movesInAscendingOrder.length; i++) {
        const move = this.movesInAscendingOrder[i];
        if (move.start < this.time) {
          if (move.end > this.previousTime) {
            selectedMoves[move.story.id] = move; // this will overwrite any previously registered moves of the same story; this is done since we want to pick the last move of the story if there are several falling within the interval
          }
        } else {
          break;
        }
      }
    } else {
      for (let i = 0; i < this.movesInDescendingOrder.length; i++) {
        const move = this.movesInDescendingOrder[i];
        if (move.end > this.time) {
          if (move.start < this.previousTime) {
            selectedMoves[move.story.id] = move; // this will overwrite any previously registered moves of the same story; this is done since we want to pick the first move of the story if there are several falling within the interval
          }
        } else {
          break;
        }
      }
    }

    for (var storyId in selectedMoves) {
      selectedMoves[storyId].moveTokenToPositionAtAnimationMoment(this.time);
    }

    // Execute external event handler
    this.eventHandler(
      new TimelineEvent(this.time, this.getProgress(), this.isDone())
    );
  };

  this.getProgress = () => {
    return this.time / this.endTime;
  };

  this.getEndTime = () => {
    return this.endTime;
  };

  this.isDone = () => {
    return this.time > this.endTime;
  };

  this.speed = speed => {
    // TODO
    return 1;
  };

  this.setTime = time => {
    this.previousTime = this.time;
    this.time = Math.max(Math.min(time, this.endTime), 0);
    this.processTimelineEvent();
  };

  this.clear = () => {
    this.movesInAscendingOrder.length = 0;
    this.movesInDescendingOrder.length = 0;
    this.time = 0;
    this.previousTime = 0;
    this.endTime = 0;
    this.playing = false;
  };

  this.sort = () => {
    this.movesInAscendingOrder.sort((move1, move2) => {
      if (move1.start < move2.start) {
        return -1;
      } else if (move1.start > move2.start) {
        return 1;
      } else {
        return 0;
      }
    });

    this.movesInDescendingOrder.sort((move1, move2) => {
      if (move1.end > move2.end) {
        return -1;
      } else if (move1.end < move2.end) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  /*
  pause;
  stop;
  time;
  speed;
  */
}
