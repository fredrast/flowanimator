// Constructor for objects to represent the column transitions in the current project
export function Transition(
  story,
  fromColumn,
  toColumn,
  timestamp,
  transitionStartDateTime
) {
  this.story = story;
  this.fromColumn = fromColumn;
  this.toColumn = toColumn;
  this.timestamp = timestamp;
  this.date = new Date(timestamp).toISOString();
  this.transitionStartDateTime = transitionStartDateTime;

  // /* console.log(new Date(this.timestamp).toISOString()); */

  this.getTimeStamp = function() {
    return this.timeStamp.getTime();
  };

  this.getTransitionStartDateTime = () => {
    return this.transitionStartDateTime;
  };

  this.getTransitionStartOnTimeline = () => {
    if (
      // these are not set in the constructor but only later on from within animation.js, so better check for their presence to be sure
      Transition.dateTimeToAnimationTime &&
      this.getFirstTransitionDate
    ) {
      return Transition.dateTimeToAnimationTime(
        this.getTransitionStartDateTime() - this.getFirstTransitionDate()
      );
    }
  };
}

export function TransitionCollection() {
  var transitions = [];
  this.publicTransitions = transitions; // DEBUG

  this.push = transition => {
    transitions.push(transition);
  };

  this.addTransitions = transitionsToAdd => {
    transitions = transitions.concat(transitionsToAdd);
    this.publicTransitions = transitions; //DEBUG
  };

  this.clear = function() {
    transitions.length = 0;
    transitions = []; // TODO what is the most appropriate way to clear an array?
    /* console.log('**************** transitionCollection cleared!'); */
  };

  Transition.prototype.getSortOrder = (firstTransition, secondTransition) => {
    if (
      firstTransition.transitionStartDateTime <
      secondTransition.transitionStartDateTime
    ) {
      return -1;
    } else if (
      firstTransition.transitionStartDateTime >
      secondTransition.transitionStartDateTime
    ) {
      return 1;
    } else {
      // Same timestamp, need some other way to determine the sort order
      if (firstTransition.story === secondTransition.story) {
        // Same timestamp, case 1:
        // Same issue transitioning over several columns at the same time,
        // sorting according to the sequence of the columns transitioned into
        if (
          firstTransition.toColumn.number < secondTransition.toColumn.number
        ) {
          return -1;
        } else {
          return 1;
        }
      } else {
        // Same timestamp, case 2:
        // Different issues transitioning at the same time,
        // sort order is arbitrary but result should be conistent,
        // sorting according to the alphabetic order of the issue id:s
      }
      return firstTransition.story.id.localeCompare(secondTransition.story.id);
    }
  };

  this.sort = function() {
    transitions.sort(Transition.prototype.getSortOrder);
  };

  this.getFirstTransitionDate = () => {
    return transitions[0].transitionStartDateTime;
  };

  Transition.prototype.getFirstTransitionDate = this.getFirstTransitionDate; // Making it possible to get the first transition date also on Transition level, which makes it possible for the transition to calculate its own animation start time

  this.getLastTransitionDate = () => {
    return transitions[transitions.length - 1].transitionStartDateTime;
  };

  this.getTimespan = function() {
    return this.getLastTransitionDate() - this.getFirstTransitionDate();
  };

  this.getIterator = function*() {
    for (var transition of transitions) {
      yield transition;
    }
  };

  // this.getPreviousInAnimationFinishInToColumn = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousInTransitionInToColumn = transitions
  //     .filter(
  //       // extract the prior transitions into the toColumn of the nextTransition
  //       otherTansition =>
  //         otherTansition.toColumn == nextTransition.toColumn &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousInTransitionInToColumn != 'undefined') {
  //     return previousInTransitionInToColumn.previousAnimationFinish;
  //   } else {
  //     // previousInTransitionInToColumn is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousOutAnimationFinishInToColumn = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousOutTransitionInToColumn = transitions
  //     .filter(
  //       // extract the prior transitions iout of the toColumn of the nextTransition
  //       otherTansition =>
  //         otherTansition.fromColumn == nextTransition.toColumn &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousOutTransitionInToColumn != 'undefined') {
  //     return previousOutTransitionInToColumn.previousAnimationFinish;
  //   } else {
  //     // previousOutTransitionInToColumn is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousInAnimationFinishInFromColumn = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousInTransitionsInFromColumn = transitions
  //     .filter(
  //       // extract the prior transitions into the toColumn of the nextTransition
  //       otherTansition =>
  //         otherTansition.toColumn == nextTransition.fromColumn &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousInTransitionInFromColumn != 'undefined') {
  //     return previousInTransitionInFromColumn.previousAnimationFinish;
  //   } else {
  //     // previousInTransitionInFromColumn is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousOutAnimationFinishInFromColumn = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousOutTransitionsInFromColumn = transitions
  //     .filter(
  //       // extract the prior transitions into the toColumn of the nextTransition
  //       otherTansition =>
  //         otherTansition.fromColumn == nextTransition.fromColumn &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //   if (typeof previousOutTransitionsInFromColumn != 'undefined') {
  //     return previousOutTransitionsInFromColumn.previousAnimationFinish;
  //   } else {
  //     // previousOutTransitionsInFromColumn is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
}
