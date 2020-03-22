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
  const moves = [];
  this.moves = moves;
  this.addMove = (
    story,
    start,
    duration,
    fromColumn,
    toColumn,
    fromSlot,
    toSlot
  ) => {
    moves.push(
      new Move(story, start, duration, fromColumn, toColumn, fromSlot, toSlot)
    );
    story.addMove(start, duration, fromColumn, toColumn, fromSlot, toSlot);
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
}
