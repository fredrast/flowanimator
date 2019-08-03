// import * as SVG from './node_modules/svg.js/dist/svg.js';
'use strict';

import { BUTTON_WIDTH, Button } from './button.js';
import { stringToDate } from './utils.js';

// Global constants, mainly for tweaking the look&feel of the app
const TOKEN_WIDTH = 20;
const MARGIN = 10;
const CANVAS_MIN_WIDTH = 700;
const SLIDER_MARGIN = 40;
const SLIDER_MIN_WIDTH = CANVAS_MIN_WIDTH - 2 * SLIDER_MARGIN;
const SLIDER_MAX_WIDTH = 1200;
const CANVAS_LEFT = 0;
const CANVAS_BOTTOM = 0;
const CONTROLS_Y = CANVAS_BOTTOM - 3 * MARGIN - BUTTON_WIDTH;
const SLIDER_BUTTON_RADIUS = 32;
const SLIDER_LINE_WIDTH = 15;
const SLIDER_CY = CONTROLS_Y - MARGIN - SLIDER_BUTTON_RADIUS / 2;
const STATUS_LABELS_Y = CONTROLS_Y - 2 * MARGIN - SLIDER_BUTTON_RADIUS;

const UNCREATED_STATUS_X = -100;
const UNCREATED_STATUS_Y = -100; // STATUS_LABELS_Y - MARGIN;
const UNCREATED_STATUS_ID = 0;
const DATE_FORMAT = 'dd.mm.yyyy';
const UNCREATED_SLOT = 0;
// TODO remove if eventually not needed: const ANIMATION_DURATION = 60000;
const TRANSITION_DURATION = 200;
const DROP_DURATION = 100;
const DROP_DELAY = 15;

const SLIDER_FULL_LENGTH = window.innerWidth - 2 * SLIDER_MARGIN;

const DAY_IN_MS = 86400000;

const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the JIRA import file before the transitions start

// Global variables -- shame on me!! ;-)
var factor;
const storyCollection = [];
var uncreatedStatus = {};
// const transitions = [];
const statuses = [];

var sliderWidth;

var file;
var projectDuration;
var animationDuration;
var animationDurationEstimate;
var animationPlaying = false;
var zoomFactor = 1;

/******************************************************************************/
/*           CANVAS AND BACKGROUND                                            */
/******************************************************************************/

// Create drawing canvas and paint the background
const canvas = SVG('svg');
canvas.size(window.innerWidth, window.innerHeight);
canvas.viewbox({
  x: CANVAS_LEFT,
  y: CANVAS_BOTTOM - window.innerHeight,
  width: window.innerWidth,
  height: window.innerHeight,
});

var background = canvas
  .rect(window.innerWidth, window.innerHeight)
  .fill('#97F9F9');

const controls = canvas
  .group()
  .translate(
    SLIDER_MARGIN + SLIDER_FULL_LENGTH / 2 - 2.5 * BUTTON_WIDTH - 2 * MARGIN,
    CONTROLS_Y
  );

const dateText = canvas.text('Date goes here');
dateText.x(canvas.viewbox().x + SLIDER_MARGIN);
dateText.cy(CONTROLS_Y + BUTTON_WIDTH / 2);
dateText.font({
  family: 'Helvetica',
  size: 12,
  anchor: 'right',
  leading: '1.5em',
});

function canvasResize() {
  //
  canvas.size(window.innerWidth, window.innerHeight);

  const deltaX = window.innerWidth * zoomFactor - canvas.viewbox().width;

  canvas.viewbox({
    x: canvas.viewbox().x - deltaX / 2,
    y: CANVAS_BOTTOM - window.innerHeight * zoomFactor,
    width: window.innerWidth * zoomFactor,
    height: window.innerHeight * zoomFactor,
  });

  background.size(canvas.viewbox().width, canvas.viewbox().height);
  background.move(canvas.viewbox().x, canvas.viewbox().y);

  //
}

window.addEventListener('resize', canvasResize);
canvasResize();

/******************************************************************************/
/*           TIMELINE                                                         */
/******************************************************************************/

// Timeline for animation
const timeline = new SVG.Timeline().persist(true);

timeline.getEndTime = function() {
  if (timeline._runners.length > 0) {
    return (
      timeline._runners[timeline._runners.length - 1].start +
      timeline._runners[timeline._runners.length - 1].runner._duration
    );
  } else {
    // above statements give error if no runners added to the timeline yet -- in that case, the endTime is anyway per definition 0
    return 0;
  }
};

timeline.getLastAnimationStart = function() {
  if (timeline._runners.length > 0) {
    return timeline._runners[timeline._runners.length - 1].start;
  } else {
    // above statements give error if no runners added to the timeline yet -- in that case, the endTime is anyway per definition 0
    return 0;
  }
};

timeline.isDone = function() {
  if (this.time() >= this.getEndTime()) {
    return true;
  } else {
    return false;
  }
};

// timeline.pause();

/******************************************************************************/
/*            MAIN DATA STRUCTURES                                            */
/******************************************************************************/

// Constructor for objects to represent the statuses in the current project
function Status(number, name, center) {
  this.number = number;
  this.name = name;
  this.center = center;
  this.storiesInStatus = [];
  this.text = canvas.text('');
  this.text.font({
    family: 'Helvetica',
    size: 10,
    anchor: 'middle',
    leading: '1.5em',
  });
}

// Constructor for objects to represent the status transitions in the current project
function Transition(story, fromStatus, toStatus, timeStamp) {
  this.story = story;
  this.fromStatus = fromStatus;
  this.toStatus = toStatus;
  this.timeStamp = timeStamp;
  this.previousAnimationFinish = 0;

  this.getTimeStamp_ms = function() {
    return this.timeStamp.getTime();
  };
}

function TransitionCollection() {
  this.transitions = [];
  this.push = function(transition) {
    this.transitions.push(transition);
  };
  // this.getItem = function(index) {
  //   return this.items[index];
  // };
  this.clear = function() {
    this.transitions.length = 0;
  };

  this.sort = function() {
    this.transitions.sort((firstTransition, secondTransition) => {
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
    const firstTransitionTime = this.transitions[0].timeStamp.getTime();
    const lastTransitionTime = this.transitions[
      this.transitions.length - 1
    ].timeStamp.getTime();
    return lastTransitionTime - firstTransitionTime;
  };

  this.getFirstTransitionTime = () => {
    return this.transitions[0].timeStamp;
  };

  this.getFirstTransitionTime_ms = () => {
    return this.transitions[0].timeStamp.getTime();
  };

  this.getIterator = function*() {
    for (var transition of this.transitions) {
      yield transition;
    }
  };

  this.getPreviousInAnimationFinishInToStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousInTransitionInToStatus = this.transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.toStatus == nextTransition.toStatus &&
          this.transitions.indexOf(otherTansition) <
            this.transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousInTransitionInToStatus != 'undefined') {
      // DEBUG
      if (
        nextTransition.story.id == 'OFI-1590' &&
        nextTransition.toStatus.name == '07 SIT Testing'
      ) {
        console.log(
          'Previous in transition in to status: ' +
            previousInTransitionInToStatus.story.id
        );
      }
      return previousInTransitionInToStatus.previousAnimationFinish;
    } else {
      // previousInTransitionInToStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousOutAnimationFinishInToStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousOutTransitionInToStatus = this.transitions
      .filter(
        // extract the prior transitions iout of the toStatus of the nextTransition
        otherTansition =>
          otherTansition.fromStatus == nextTransition.toStatus &&
          this.transitions.indexOf(otherTansition) <
            this.transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousOutTransitionInToStatus != 'undefined') {
      // DEBUG
      if (
        nextTransition.story.id == 'OFI-1590' &&
        nextTransition.toStatus.name == '07 SIT Testing'
      ) {
        console.log('');
        console.log(
          'Previous out transition in to status: ' +
            previousOutTransitionInToStatus.story.id
        );
      }
      return previousOutTransitionInToStatus.previousAnimationFinish;
    } else {
      // previousOutTransitionInToStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousInAnimationFinishInFromStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousInTransitionsInFromStatus = this.transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.toStatus == nextTransition.fromStatus &&
          this.transitions.indexOf(otherTansition) <
            this.transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousInTransitionInFromStatus != 'undefined') {
      // DEBUG
      if (
        nextTransition.story.id == 'OFI-1590' &&
        nextTransition.toStatus.name == '07 SIT Testing'
      ) {
        console.log(
          'Previous in transition in from status: ' +
            previousInTransitionInFromStatus.story.id
        );
      }
      return previousInTransitionInFromStatus.previousAnimationFinish;
    } else {
      // previousInTransitionInFromStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  this.getPreviousOutAnimationFinishInFromStatus = function(nextTransition) {
    // this.sort(); // TODO not best possible solution to have to sort multiple times
    const previousOutTransitionsInFromStatus = this.transitions
      .filter(
        // extract the prior transitions into the toStatus of the nextTransition
        otherTansition =>
          otherTansition.fromStatus == nextTransition.fromStatus &&
          this.transitions.indexOf(otherTansition) <
            this.transitions.indexOf(nextTransition)
      )
      .slice(-1)[0]; // extract the last one of the extracted transitions
    // and return the recorded end point of this transition's animation

    if (typeof previousOutTransitionInFromStatus != 'undefined') {
      // DEBUG
      if (
        nextTransition.story.id == 'OFI-1590' &&
        nextTransition.toStatus.name == '07 SIT Testing'
      ) {
        console.log(
          'Previous out transition in from status: ' +
            previousOutTransitionInFromStatus.story.id
        );
        console.log('');
      }
      return previousOutTransitionInFromStatus.previousAnimationFinish;
    } else {
      // previousInTransitionInFromStatus is undefined, i.e. no prior transition was found
      return 0;
    }
  };

  // this.length = () => this.transitions.length;
  // this.item = index => this.transitions[index];
}

const transitions = new TransitionCollection();

// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
function Story(storyLine) {
  const storyFields = storyLine.split(';');

  if (storyFields.length == 0) {
    // TODO: raise som error here
  }

  // Initiate the properties of the story
  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  // this.transitions = [];

  // this.status = statuses[UNCREATED_STATUS_ID];
  // this.status.storiesInStatus.push(this);

  this.status = statuses[UNCREATED_STATUS_ID];
  this.status.storiesInStatus.push(this);
  this.verticalSlot = UNCREATED_SLOT;

  this.elements = canvas.nested();
  this.elements.move(UNCREATED_STATUS_X, UNCREATED_STATUS_Y);
  this.token = this.elements.circle(TOKEN_WIDTH);
  this.token.timeline(timeline);
  this.tooltip = this.elements.text(this.id);
  this.tooltip.font({
    family: 'Helvetica',
    size: 10,
    anchor: 'left',
    leading: '1.5em',
    fill: '#053569',
  });
  this.tooltip.x(TOKEN_WIDTH + MARGIN / 2);

  this.tooltip.show();
  this.token.on('mouseover', e => {
    this.tooltip.show();
    // this.tooltip.move(this.token.x() + TOKEN_WIDTH + MARGIN, this.token.y());
  });
  this.token.on('mouseout', e => {
    // this.tooltip.hide();
  });
  this.previousTransitionAnimationFinish = 0; // Used during animation build, holding the timestamp when the prior transitionanimation was finished to avoid that next transition or drop animation starts before previous is finished
  this.previousDropAnimationFinish = 0; // As above, for previous drop animation
  // Create the transitions and push them onto the transitions array
  var previousStatus = statuses[UNCREATED_STATUS_ID];
  for (var fieldNo = 3; fieldNo < storyFields.length; fieldNo++) {
    if (storyFields[fieldNo] != '') {
      const transition = new Transition(
        this,
        previousStatus,
        statuses[fieldNo - 2],
        stringToDate(storyFields[fieldNo], DATE_FORMAT)
      );

      transitions.push(transition);
      previousStatus = statuses[fieldNo - 2];
      // console.log('New transition pushed:');
      // console.log(transition);
      // console.log();
    }
  }
}

/******************************************************************************/
/*            LOADING NEW FILE AND CREATING ANIMATION                         */
/******************************************************************************/

// Input element for invoking file open dialog for selecting input file
var input = document.createElement('input');
input.type = 'file';

// Event handler getting triggered after the user has selected a file
// in the file open dialog
input.onchange = e => {
  // console.log('input.onchange fired');
  file = e.target.files[0];
  if (!file) return;

  // Launch the reading of stories and transitions from the file that
  // the user selected
  readStoriesAndTransitionsFromFile(file);
  // clear the value of the file open element so that next time the onchange
  // event will be triggered also when the user selects the same file again
  input.value = '';
};

// Parse the first line of the input file holding the statuses
// and create status objects for each encountered status
const addStatuses = statusLine => {
  uncreatedStatus = new Status(0, 'Uncreated', UNCREATED_STATUS_X);
  statuses.push(uncreatedStatus);
  var fields = statusLine.split(';');
  const statusWidth = (canvas.width() - MARGIN) / (fields.length - 3) - MARGIN;

  for (
    var fieldNo = ATTRIBUTE_FIELDS_IN_IMPORT_FILE; // start looping through fields where the transition fields start i.e. after the story attribute fields
    fieldNo < fields.length;
    fieldNo++
  ) {
    const statusNo = fieldNo - ATTRIBUTE_FIELDS_IN_IMPORT_FILE + 1; // status number 0 used for uncreates status, hence +1
    const statusCenter =
      MARGIN + statusNo * (statusWidth + MARGIN) + statusWidth / 2;

    if (fields[fieldNo] != '') {
      // disregard any empty fields
      const status = new Status(fieldNo, fields[fieldNo], statusCenter);

      statuses.push(status);
      status.text.text(fields[fieldNo]);
      status.text.move(statusCenter, STATUS_LABELS_Y);
      status.text.width = statusWidth;
    }
  }
};

// Clear the current statuses, stories, transitions and timeline
// before a new input file gets read
function clearPreviousProject() {
  statuses.forEach(status => {
    if (status.text) status.text.remove();
    status = null;
  });
  statuses.length = 0;
  storyCollection.forEach(story => {
    story.token.remove();
    story.status = null;
    story.elements.remove();
    story.tooltip.remove();
    story = null;
  });
  storyCollection.length = 0;
  transitions.clear();
  sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);

  timeline._runners.length = 0;
  sliderLine.width(1);
  animationPlaying = false;
}

// Read the input file and initiate the generation of statuses, stories and
// transitions found in the file
function readStoriesAndTransitionsFromFile(file) {
  // Prepare a FileReader to read the contents of the file
  var reader = new FileReader();
  // What to do once the FileReader is done opening the file
  reader.onload = function(e) {
    // console.log('Executing readStoriesAndTransitionsFromFile');
    var contents = e.target.result;

    clearPreviousProject(); // Now's the time to clear the previous project
    var lines = contents.match(/[^\r\n]+/g);

    addStatuses(lines[0]); // Read and create statuses from first line in file

    //  Read and create stories and status transitions from subsequent lines in file
    for (var lineNo = 1; lineNo < lines.length; lineNo++) {
      if (lines[lineNo] != '') {
        // disregard any possible empty lines
        const story = new Story(lines[lineNo]);
        storyCollection.push(story);
      }
    }
    // console.log('Before sort:');
    // console.log(transitions);
    transitions.sort();
    // console.log('After sort:');
    // console.log(transitions);

    // Launch the building of the animation based on the status transitions

    buildAnimation();
    btnPlay.activate();
    btnStop.activate();
  };

  // Done preparing the FileReader, now time to execute it
  reader.readAsText(file);
}

// Build the animation timeline with the stories' status transitions
// based on the status transitions in the transitions object
function buildAnimation() {
  // Determine the timespan of the transitions from first to last -- since they
  // were just sorted by timestamp, we can find the first transition as the
  // first element in the Array and the last transition as the last element
  // firstTransitionTime_ms = transitions[0].timeStamp.getTime();
  // lastTransitionTime_ms = transitions[
  //   transitions.length - 1
  // ].timeStamp.getTime();
  // projectTimespan_ms =
  //   lastTransitionTime_ms - firstTransitionTime_ms + DAY_IN_MS; // another day for the last-day transitions to complete
  // projectDuration =
  //   projectTimespan *
  //   (ANIMATION_DURATION / (ANIMATION_DURATION - TRANSITION_DURATION));

  animationDuration = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
    (transitions.getTimespan_ms() / DAY_IN_MS) * TRANSITION_DURATION * 2 +
    TRANSITION_DURATION;

  animationDurationEstimate = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
    (transitions.getTimespan_ms() / DAY_IN_MS) * TRANSITION_DURATION * 2;

  console.log('transitions.getTimespan_ms(): ' + transitions.getTimespan_ms());
  console.log('animationDuration: ' + animationDuration);

  function setIntervalAsync(fn, delay, callback) {
    fn().then(promiseResponse => {
      if (!promiseResponse.done) {
        setTimeout(() => setIntervalAsync(fn, delay, callback), delay);
      } else {
        callback();
      }
    });
  }

  const animationGenerator = AnimationGenerator();

  setIntervalAsync(
    async () => {
      return animationGenerator.next();
    },
    0,
    () => {
      // Callback function called upon completion of the generator
      factor = animationDuration / SLIDER_FULL_LENGTH;
      console.log(transitions);
    }
  );
}

function* AnimationGenerator() {
  for (var transition of transitions.getIterator()) {
    const storyToMove = transition.story;
    const fromStatus = storyToMove.status;
    var fromSlot = storyToMove.verticalSlot;
    const toStatus = transition.toStatus;
    toStatus.storiesInStatus.push(storyToMove);
    const toSlot = toStatus.storiesInStatus.indexOf(storyToMove);

    // Make new stories fly in vertically by positioning them
    // on the height of their destination slot
    if (fromStatus == uncreatedStatus) {
      fromSlot = toSlot;
      storyToMove.elements.y(slotToYCoord(toSlot));
    }

    // Determine where the transition should be positioned on the timeline
    // This is based on the time stamp of the transition in proportion to
    // the entire timespan that the timeline represents.
    // We also want to make sure that the next transition animation
    // of an issue token doesn't start before
    // a) the previous animation of that issue token
    // b) any previous animations in toStatus
    // have been completed.
    // Hence the max function to get the largest of the calculated starting
    // point, the record of the finishing point of the previous transition,
    // and the finishing point of the previous animation to or from the toStatus

    const transitionStartOnTimeline = Math.max(
      ((transition.getTimeStamp_ms() -
        transitions.getFirstTransitionTime_ms()) /
        DAY_IN_MS) *
        TRANSITION_DURATION *
        2,
      storyToMove.previousTransitionAnimationFinish,
      storyToMove.previousDropAnimationFinish,
      transitions.getPreviousInAnimationFinishInToStatus(transition) -
        TRANSITION_DURATION,
      transitions.getPreviousOutAnimationFinishInToStatus(transition) -
        TRANSITION_DURATION,
      transitions.getPreviousInAnimationFinishInFromStatus(transition),
      transitions.getPreviousOutAnimationFinishInFromStatus(transition) -
        TRANSITION_DURATION
      // TODO: add call to function giving previous transition into or out of toStatus
    );

    console.log('');
    console.log(
      'transition.getTimeStamp_ms(): ' + transition.getTimeStamp_ms()
    );
    console.log(
      'transitions.getFirstTransitionTime_ms(): ' +
        transitions.getFirstTransitionTime_ms()
    );
    console.log(
      'transitions.getTimespan_ms(): ' + transitions.getTimespan_ms()
    );
    console.log('animationDuration: ' + animationDuration);
    console.log(
      'Formula: ' +
        ((transition.getTimeStamp_ms() -
          transitions.getFirstTransitionTime_ms()) /
          DAY_IN_MS) *
          TRANSITION_DURATION *
          2
    );
    console.log('transitionStartOnTimeline: ' + transitionStartOnTimeline);
    console.log('');

    // if (storyToMove.id == 'OFI-1572' && toStatus.name == '01 Idea') {
    //   console.log(statuses);
    // }

    storyToMove.previousTransitionAnimationFinish =
      transitionStartOnTimeline + TRANSITION_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds
    transition.previousAnimationFinish =
      transitionStartOnTimeline + TRANSITION_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds

    storyToMove.elements
      .timeline(timeline)
      .animate(TRANSITION_DURATION, transitionStartOnTimeline, 'absolute')
      .move(statusToXCoord(toStatus), slotToYCoord(toSlot));
    // .move(statusToXCoord(toStatus), slotToYCoord(toSlot));
    storyToMove.status = toStatus;

    storyToMove.verticalSlot = toSlot;

    fromStatus.storiesInStatus.splice(fromSlot, 1); // Take out the story that just transitioned out

    // Perform drops on the stories in fromStatus that were above the
    // story that transitioned out
    const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);

    if (fromStatus != uncreatedStatus) {
      // No need to perform drop operation on stories in uncreated status
      storiesToDrop.forEach(storyToDrop => {
        const dropFromSlot = storyToDrop.verticalSlot;
        const dropToSlot = storyToDrop.verticalSlot - 1;
        const dropStartOnTimeLine = Math.max(
          // Make sure the animation doesn't start before any possible ongoing animation has finished
          transitionStartOnTimeline + DROP_DELAY,
          storyToDrop.previousDropAnimationFinish
        );

        storyToDrop.previousDropAnimationFinish =
          dropStartOnTimeLine + DROP_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds

        storyToDrop.elements
          .timeline(timeline)
          .animate(DROP_DURATION, dropStartOnTimeLine, 'absolute')
          .y(slotToYCoord(dropToSlot));
        storyToDrop.verticalSlot = dropToSlot;
      });
    }

    // console.log(
    //   new Date(transition.timeStamp).toISOString() +
    //     ' - ' +
    //     new Date(
    //       (transitionStartOnTimeline / animationDuration) *
    //         transitions.getTimespan_ms() +
    //         transitions.getFirstTransitionTime().getTime()
    //     ).toISOString() +
    //     ' - ' +
    //     Math.round(timeline.getEndTime())
    // );

    // The last transitions in the project may get pushed forward beyond our
    // original estimated animationduration; in such cases we want to extend
    // the animationDuration accordingly so that it's as long as the actual animation
    // timeline
    animationDuration = Math.max(animationDuration, timeline.getEndTime());

    sliderLine.width(
      (timeline.getEndTime() / animationDuration) * SLIDER_FULL_LENGTH
    );
    console.log(timeline.getEndTime() + ' / ' + animationDuration);
    if (!animationPlaying) {
      timeline.pause();
    }

    // DEBUG
    // if (storyToMove.id == 'OFI-2475' && toStatus.name == '06 Development') {
    //   new Date(transition.timeStamp).toISOString();
    //   statuses.forEach(status => {
    //     var statusString =
    //       new Date(transition.timeStamp).toISOString() +
    //       ' : ' +
    //       status.name +
    //       ': ';
    //     status.storiesInStatus.forEach(story => {
    //       statusString += story.id + '(' + story.verticalSlot + '), ';
    //     });
    //     console.log(statusString);
    //   });
    //   console.log('');
    // }

    yield 'Another transition processed'; // DEBUG
  }

  console.log(timeline);
  return 'All transitions processed';
}

/******************************************************************************/
/*                     COORDINATE TRANSLATIONS                                */
/******************************************************************************/

// give the x coordinate on the canvas of a status #
function statusToXCoord(status) {
  return status.center - TOKEN_WIDTH / 2;
}

// give the y coordinate on the canvas of a vertical slot #
function slotToYCoord(slot) {
  return STATUS_LABELS_Y - MARGIN - slot * TOKEN_WIDTH - TOKEN_WIDTH / 2;
}

/******************************************************************************/
/*                                 BUTTONS                                    */
/******************************************************************************/

// Create and position the controls and set their click handlers

const btnOpen = new Button('open', canvas, 0, 0, () => {
  input.click();
});
btnOpen.activate();
controls.add(btnOpen.elements);

const btnPlay = new Button('play', canvas, MARGIN + BUTTON_WIDTH, 0, () => {
  if (animationPlaying) {
    timeline.pause();
    animationPlaying = false;
  } else {
    // start playing from the beginning if we were at the end of the timeline
    if (timeline.isDone()) {
      timeline.time(0);
    }
    timeline.play();
    animationPlaying = true;
  }
});

controls.add(btnPlay.elements);

const btnStop = new Button(
  'stop',
  canvas,
  MARGIN * 2 + BUTTON_WIDTH * 2,
  0,
  () => {
    timeline.stop();
    animationPlaying = false;
    sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
  }
);
controls.add(btnStop.elements);

const btnZoomOut = new Button(
  'scale',
  canvas,
  MARGIN * 3 + BUTTON_WIDTH * 3,
  0,
  () => {
    zoomFactor = zoomFactor * 1.25;
    canvasResize();
  }
);
btnZoomOut.activate();
controls.add(btnZoomOut.elements);

const btnZoomIn = new Button(
  'scale',
  canvas,
  MARGIN * 4 + BUTTON_WIDTH * 4,
  0,
  () => {
    zoomFactor = zoomFactor * 0.8;
    canvasResize();
  }
);
btnZoomIn.activate();
controls.add(btnZoomIn.elements);

/******************************************************************************/
/*                                SLIDER                                      */
/******************************************************************************/

const sliderBackground = canvas
  .line(SLIDER_MARGIN, SLIDER_CY, SLIDER_MARGIN + SLIDER_FULL_LENGTH, SLIDER_CY)
  .stroke({
    color: 'white',
    width: SLIDER_LINE_WIDTH,
    opacity: 1,
    linecap: 'round',
  });

const sliderLine = canvas
  .line(SLIDER_MARGIN, SLIDER_CY, SLIDER_MARGIN + 1, SLIDER_CY)
  .stroke({
    color: 'black',
    width: SLIDER_LINE_WIDTH,
    opacity: 0.5,
    linecap: 'round',
  });

sliderLine.on('click', e => {
  const { x } = sliderLine.point(e.pageX, e.pageY);
  const progress = x - SLIDER_MARGIN;

  timeline.time(Math.round(progress * factor));

  sliderButton.cx(x);
});

const sliderButton = canvas.circle(SLIDER_BUTTON_RADIUS);
sliderButton.fill({
  color: 'black',
  opacity: 0.8,
});
sliderButton.x(CANVAS_LEFT + SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
sliderButton.cy(SLIDER_CY);
sliderButton.draggable();

sliderButton.on('dragmove.namespace', e => {
  const { handler, box } = e.detail;
  e.preventDefault();

  var x = box.x;

  if (x < SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2) {
    x = SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2;
  }

  if (x > SLIDER_MARGIN + SLIDER_FULL_LENGTH - SLIDER_BUTTON_RADIUS / 2) {
    x = SLIDER_MARGIN + SLIDER_FULL_LENGTH - SLIDER_BUTTON_RADIUS / 2;
  }

  var progress = x + SLIDER_BUTTON_RADIUS / 2 - SLIDER_MARGIN;

  timeline.time(Math.round(progress * factor));

  handler.move(x, SLIDER_CY - SLIDER_BUTTON_RADIUS / 2);
});

timeline.on('time', e => {
  // Move the slider button forward in accordance with the progress
  // of the animation
  var x = e.detail / factor + SLIDER_MARGIN;
  if (x > SLIDER_FULL_LENGTH + SLIDER_MARGIN) {
    x = SLIDER_FULL_LENGTH + SLIDER_MARGIN;
  }
  sliderButton.cx(x);

  // Determining the date of the current point in the animation

  const currentAnimationDate = new Date(
    transitions.getFirstTransitionTime_ms() +
      (e.detail / animationDurationEstimate) * transitions.getTimespan_ms()
  );

  console.log('');
  console.log(
    'transitions.getFirstTransitionTime_ms():' +
      transitions.getFirstTransitionTime_ms()
  );
  console.log('e.detail: ' + e.detail);
  console.log('animationDurationEstimate: ' + animationDurationEstimate);

  dateText.clear();
  // dateText.text(currentAnimationDate.toISOString().substring(0, 10));
  dateText.text(
    new Intl.DateTimeFormat('fi-FI', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(currentAnimationDate)
  );

  // Put our internal playing status to false if the last runner has completed
  // i.e. we have reached the end of the timeline
  if (timeline.isDone()) {
    animationPlaying = false;
  }
});

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                                                            //
//                           TRIAL & DEBUG CODE                               //
//                                                                            //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

const coordsText = canvas.text('');
coordsText.move(canvas.viewbox().x + 10, canvas.viewbox().y + 10);
coordsText.font({
  family: 'Helvetica',
  size: 10,
  anchor: 'right',
  leading: '1.5em',
});

canvas.on('mousemove', e => {
  coordsText.clear();
  coordsText.text(
    'client x: ' +
      e.clientX +
      '\n' +
      'client y: ' +
      e.clientY +
      '\n' +
      'viewbox x: ' +
      (e.clientX + canvas.viewbox().x) +
      '\n' +
      'viewbox y: ' +
      (e.clientY + canvas.viewbox().y)
  );
  //
});
