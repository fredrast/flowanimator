// Constructor for objects to represent the status transitions in the current project
export function Transition(story, fromStatus, toStatus, timeStamp) {
  this.story = story;
  this.fromStatus = fromStatus;
  this.toStatus = toStatus;
  this.timeStamp = timeStamp;
  this.previousAnimationFinish = 0;

  this.getTimeStamp_ms = function() {
    return this.timeStamp.getTime();
  };
}

export function TransitionCollection() {
  const transitions = [];

  this.push = transition => {
    transitions.push(transition);
  };

  this.clear = function() {
    transitions.length = 0;
  };

  this.sort = function() {
    transitions.sort((firstTransition, secondTransition) => {
      if (
        firstTransition.getTimeStamp_ms() < secondTransition.getTimeStamp_ms()
      ) {
        return -1;
      } else if (
        firstTransition.getTimeStamp_ms() > secondTransition.getTimeStamp_ms()
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
        return firstTransition.story.id.localeCompare(
          secondTransition.story.id
        );
      }
    });
  };

  this.getTimespan_ms = function() {
    const firstTransitionTime = transitions[0].timeStamp.getTime();
    const lastTransitionTime = transitions[
      transitions.length - 1
    ].timeStamp.getTime();
    return lastTransitionTime - firstTransitionTime;
  };

  this.getFirstTransitionTime = () => {
    return transitions[0].timeStamp;
  };

  this.getFirstTransitionTime_ms = () => {
    return transitions[0].timeStamp.getTime();
  };

  this.getIterator = function*() {
    for (var transition of transitions) {
      yield transition;
    }
  };

  this.getPreviousInAnimationFinishInToStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousInTransitionInToStatus = transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.toStatus == nextTransition.toStatus &&
          transitions.indexOf(otherTansition) <
            transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousInTransitionInToStatus != 'undefined') {
      return previousInTransitionInToStatus.previousAnimationFinish;
    } else {
      // previousInTransitionInToStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousOutAnimationFinishInToStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousOutTransitionInToStatus = transitions
      .filter(
        // extract the prior transitions iout of the toStatus of the nextTransition
        otherTansition =>
          otherTansition.fromStatus == nextTransition.toStatus &&
          transitions.indexOf(otherTansition) <
            transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousOutTransitionInToStatus != 'undefined') {
      return previousOutTransitionInToStatus.previousAnimationFinish;
    } else {
      // previousOutTransitionInToStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousInAnimationFinishInFromStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousInTransitionsInFromStatus = transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.toStatus == nextTransition.fromStatus &&
          transitions.indexOf(otherTansition) <
            transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousInTransitionInFromStatus != 'undefined') {
      return previousInTransitionInFromStatus.previousAnimationFinish;
    } else {
      // previousInTransitionInFromStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousOutAnimationFinishInFromStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousOutTransitionsInFromStatus = transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.fromStatus == nextTransition.fromStatus &&
          transitions.indexOf(otherTansition) <
            transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation
    if (typeof previousOutTransitionsInFromStatus != 'undefined') {
      return previousOutTransitionsInFromStatus.previousAnimationFinish;
    } else {
      // previousOutTransitionsInFromStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };
}
