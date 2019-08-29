// Constructor for objects to represent the status transitions in the current project
export function Transition(
  story,
  fromStatus,
  toStatus,
  timestamp,
  transitionStartDateTime
) {
  this.story = story;
  this.fromStatus = fromStatus;
  this.toStatus = toStatus;
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
        // Same issue transitioning over several statuses at the same time,
        // sorting according to the sequence of the statuses transitioned into
        if (
          firstTransition.toStatus.number < secondTransition.toStatus.number
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

  // this.getPreviousInAnimationFinishInToStatus = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousInTransitionInToStatus = transitions
  //     .filter(
  //       // extract the prior transitions into the toStatus of the nextTransition
  //       otherTansition =>
  //         otherTansition.toStatus == nextTransition.toStatus &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousInTransitionInToStatus != 'undefined') {
  //     return previousInTransitionInToStatus.previousAnimationFinish;
  //   } else {
  //     // previousInTransitionInToStatus is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousOutAnimationFinishInToStatus = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousOutTransitionInToStatus = transitions
  //     .filter(
  //       // extract the prior transitions iout of the toStatus of the nextTransition
  //       otherTansition =>
  //         otherTansition.fromStatus == nextTransition.toStatus &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousOutTransitionInToStatus != 'undefined') {
  //     return previousOutTransitionInToStatus.previousAnimationFinish;
  //   } else {
  //     // previousOutTransitionInToStatus is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousInAnimationFinishInFromStatus = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousInTransitionsInFromStatus = transitions
  //     .filter(
  //       // extract the prior transitions into the toStatus of the nextTransition
  //       otherTansition =>
  //         otherTansition.toStatus == nextTransition.fromStatus &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //
  //   if (typeof previousInTransitionInFromStatus != 'undefined') {
  //     return previousInTransitionInFromStatus.previousAnimationFinish;
  //   } else {
  //     // previousInTransitionInFromStatus is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
  //
  // this.getPreviousOutAnimationFinishInFromStatus = function(nextTransition) {
  //   // this.sort(); // TODO not best possible solution to have to sort multiple times
  //   const previousOutTransitionsInFromStatus = transitions
  //     .filter(
  //       // extract the prior transitions into the toStatus of the nextTransition
  //       otherTansition =>
  //         otherTansition.fromStatus == nextTransition.fromStatus &&
  //         transitions.indexOf(otherTansition) <
  //           transitions.indexOf(nextTransition)
  //     )
  //     .slice(-1)[0]; // extract the last one of the extracted transitions
  //   // and return the recorded end point of this transition's animation
  //   if (typeof previousOutTransitionsInFromStatus != 'undefined') {
  //     return previousOutTransitionsInFromStatus.previousAnimationFinish;
  //   } else {
  //     // previousOutTransitionsInFromStatus is undefined, i.e. no prior transition was found
  //     return 0;
  //   }
  // };
}
