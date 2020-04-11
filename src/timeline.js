/**
 * @file src/timeline.js
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
  this.end = start + duration; // TODO: end and duration redundant
  this.fromColumn = fromColumn;
  this.toColumn = toColumn;
  this.fromSlot = fromSlot;
  this.toSlot = toSlot;

  this.moveTokenToPositionAtAnimationMoment = animationMoment => {
    const progressFactor = Math.min(
      Math.max(animationMoment - this.start, 0) / this.duration,
      1
    );

    this.story.moveToken(
      this.fromColumn,
      this.fromSlot,
      this.toColumn,
      this.toSlot,
      progressFactor
    );
    this.story.setTokenVisibility(toColumn.visible);
  };
}

function TimelineEvent(time, progress, timelineDone) {
  this.time = time;
  this.progress = progress;
  this.timelineDone = timelineDone;
}

export function Timeline() {
  const INITIAL_INTERVAL = 30;

  //const movesInAscendingOrder = [];
  // const movesInDescendingOrder = [];
  const interval = INITIAL_INTERVAL;
  this.moves = [];
  this.time = 0;
  this.previousTime = 0;
  this.endTime = 0;
  // this.onTimeHandler = {};
  this.playing = false;

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
    this.moves.push(move);
    // movesInAscendingOrder.push(move);
    // movesInDescendingOrder.unshift(move);
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
        if (!response.done) {
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
    const animationDone = this.time >= this.endTime;
    return { animationDone: animationDone };
  };

  const shouldAnimationContinue = () => {
    return this.playing;
  };

  const animationCompleted = () => {
    this.playing = false;
    this.time = 0;
    this.previousTime = 0;
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
      for (var i = 0; i < this.moves.length; i++) {
        const move = this.moves[i];
        if (move.start < this.time) {
          if (move.end > this.previousTime) {
            selectedMoves[move.story.id] = move; // this will overwrite any previously registered moves of the same story; this is done since we want to pick the last move of the story if there are several falling within the interval
          }
        } else {
          break;
        }
      }
    } else {
      for (var i = this.moves.length - 1; i >= 0; i--) {
        const move = this.moves[i];
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
    return this.time >= this.endTime;
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
    this.moves.length = 0;
    this.time = 0;
    this.previousTime = 0;
    this.endTime = 0;
    this.playing = false;
  };

  /*
  pause;
  stop;
  time;
  speed;
  */
}
