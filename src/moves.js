/**
 * @file src/moves.js
 * @description TODO
 */

const OVERLAP_TIME = 100;

export function Move(
  story,
  start,
  duration,
  fromColumn,
  toColumn,
  fromSlot,
  toSlot
) {
  this.story = story;
  this.start = start;
  this.duration = duration;
  this.fromColumn = fromColumn;
  this.toColumn = toColumn;
  this.fromSlot = fromSlot;
  this.toSlot = toSlot;

  this.moveTokenToPositionAtAnimationMoment = animationMoment => {
    this.story.updatePosition(animationMoment, this);
  };
}

export function MovesCollection() {
  // TODO: decide whether moves should be public or private; making it public now to make it visible in console logs
  const movesInAscendingOrder = [];
  const movesInDescendingOrder = [];
  this.maxEndTime = 0;
  this.onTimeHandler = {};
  this.moves = movesInAscendingOrder;

  const interval = 30;
  this.time = 0;
  this.previousTime = 0;

  this.addMove = (
    story,
    start,
    duration,
    fromColumn,
    toColumn,
    fromSlot,
    toSlot
  ) => {
    const move = new Move(
      story,
      start,
      duration,
      fromColumn,
      toColumn,
      fromSlot,
      toSlot
    );
    movesInAscendingOrder.push(move);
    movesInDescendingOrder.unshift(move);
    story.addMove(start, duration, fromColumn, toColumn, fromSlot, toSlot);
    this.maxEndTime = Math.max(start + duration, this.maxEndTime);
  };

  this.clear = () => {
    moves.length = 0;
  };

  this.updateTokensAtAnimationMoment = animationMoment => {
    const movesActiveAtAnimationMoment = moves.filter(move => {
      return (
        move.start <= animationMoment &&
        move.start + move.duration >= animationMoment - OVERLAP_TIME
      );
    });

    movesActiveAtAnimationMoment.forEach(move => {
      move.moveTokenToPositionAtAnimationMoment(animationMoment);
    });
  };

  this.processTimelineEvent = (time, previousTime) => {
    const selectedMoves = {};

    if (time > previousTime) {
      for (let move of movesInAscendingOrder) {
        if (move.start < time) {
          if (move.end > previousTime) {
            selectedMoves[move.story.id] = move; // this will overwrite any previously registered moves of the same story; this is done since we want to pick the last move of the story if there are several falling within the interval
          }
        } else {
          break;
        }
      }
    } else {
      for (let move of movesInDescendingOrder) {
        if (move.end > time) {
          if (move.start < previousTime) {
            selectedMoves[move.story.id] = move; // this will overwrite any previously registered moves of the same story; this is done since we want to pick the first move of the story if there are several falling within the interval
          }
        } else {
          break;
        }
      }
    }

    selectedMoves.forEach(move => {
      move.moveTokenToPositionAtAnimationMoment(time);
    });
    // BOOKMARK
  };

  this.getEndTime = () => {
    return maxEndTime;
  };
  this.isDone = () => {};

  this.setOnTime = onTimeHandler => {
    this.onTimeHandler = onTimeHandler;
  };

  this.play = () => {
    this.playing = true;
    this.processAnimation();
  };

  this.stop = () => {
    clearTimeout(this.timeoutID);
    this.playing = false;
  };

  this.processAnimtion = () => {
    if (this.playing) {
      this.processTimelineEvent(this.time, this.previousTime);
      this.previoudTime = this.time;
      this.time += interval;

      this.timeoutID = setTimeout(this.processAnimtion(), interval);
    }
  };

  /*
  pause;
  stop;
  time;
  speed;
  */
}
