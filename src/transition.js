/**
 * @file src/transition.js
 * @description Defines the {@link Transition} class for representing the
 * status transition of an issue and the {@link TransitionCollection} class for
 * holding all the status transitions of the currently loaded project.
 */

/**
 * @constructor Transition
 * @description Constructor for objects to represent the status transitions
 * in the current project
 */
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
      Transition.calendarTimeToAnimationTime &&
      this.getFirstTransitionDate
    ) {
      return Transition.calendarTimeToAnimationTime(
        this.getTransitionStartDateTime() - this.getFirstTransitionDate()
      );
    }
  };
}

/**
 * @constructor TransitionCollection
 * @description Constructor for the for the TransitionCollection object
 * holding all the status transitions of the currently loaded project.
 */
export function TransitionCollection(TRANSITION_IN_CALENDAR_TIME) {
  this.transitions = [];

  this.push = transition => {
    this.transitions.push(transition);
  };

  this.addTransitions = transitionsToAdd => {
    this.transitions = this.transitions.concat(transitionsToAdd);
  };

  this.clear = function() {
    this.transitions.length = 0;
    this.transitions = []; // TODO what is the most appropriate way to clear an array?
    /* console.log('**************** transitionCollection cleared!'); */
  };

  Transition.prototype.TRANSITION_IN_CALENDAR_TIME = TRANSITION_IN_CALENDAR_TIME;

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
        return firstTransition.story.id.localeCompare(
          secondTransition.story.id
        );
      }
    }
  };

  this.sort = function() {
    this.transitions.sort(Transition.prototype.getSortOrder);
  };

  this.getFirstTransitionDate = () => {
    return this.transitions[0].transitionStartDateTime;
  };

  Transition.prototype.getFirstTransitionDate = this.getFirstTransitionDate; // Making it possible to get the first transition date also on Transition level, which makes it possible for the transition to calculate its own animation start time

  this.getLastTransitionDate = () => {
    return this.transitions[this.transitions.length - 1]
      .transitionStartDateTime;
  };

  this.getTimespan = function() {
    return this.getLastTransitionDate() - this.getFirstTransitionDate();
  };

  this.getIterator = function*() {
    for (var transition of this.transitions) {
      yield transition;
    }
  };
}
