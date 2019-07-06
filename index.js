// import * as SVG from './node_modules/svg.js/dist/svg.js';
'use strict';

import { BUTTON_WIDTH, Button } from './button.js';
import { stringToDate } from './utils.js';

// Global constants, mainly for tweaking the look&feel of the app
const TOKEN_WIDTH = 20;
const MARGIN = 10;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const CANVAS_LEFT = 0;
const CANVAS_BOTTOM = 0;
const CONTROLS_Y = CANVAS_BOTTOM - 3 * MARGIN - BUTTON_WIDTH;
const SLIDER_BUTTON_RADIUS = 32;
const SLIDER_LINE_WIDTH = 15;
const SLIDER_CY = CONTROLS_Y - MARGIN - SLIDER_BUTTON_RADIUS / 2;
const STATUS_LABELS_Y = CONTROLS_Y - 2 * MARGIN - SLIDER_BUTTON_RADIUS;

const UNCREATED_STATUS_X = -100;
const UNCREATED_STATUS_Y = 0; // STATUS_LABELS_Y - MARGIN;
const UNCREATED_STATUS_ID = 0;
const UNCREATED_SLOT = 0;
const DATE_FORMAT = 'dd.mm.yyyy';
const ANIMATION_DURATION = 5000;
const TRANSITION_DURATION = 300;
const DROP_DURATION = 100;

const SLIDER_MARGIN = 40;
const SLIDER_FULL_LENGTH = window.innerWidth - 2 * SLIDER_MARGIN;

console.log(window.innerWidth);
console.log(SLIDER_FULL_LENGTH);

// Global variables -- shame on me!! ;-)
var factor;
const storyCollection = [];
var uncreatedStatus = {};
const transitions = [];
const statuses = [];
var file;
var firstTransitionTime;
var lastTransitionTime;
var projectDuration;
var animationPlaying = false;
var zoomFactor = 1;

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

function canvasResize() {
  console.log(window.innerWidth + 'x' + window.innerHeight);
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

  // console.log(canvas.viewbox());
}

window.addEventListener('resize', canvasResize);
canvasResize();

// Timeline for animation
const timeline = new SVG.Timeline().persist(true);

timeline.endTime = function() {
  return (
    timeline._runners[timeline._runners.length - 1].start +
    timeline._runners[timeline._runners.length - 1].runner._duration
  );
};

timeline.isDone = function() {
  if (timeline.time() >= timeline.endTime()) {
    return true;
  } else {
    return false;
  }
};

timeline.pause();

// Input element for invoking file open dialog for selecting input file
var input = document.createElement('input');
input.type = 'file';

// Constructor for objects to represent the statuses in the current project
function Status(name, center) {
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
function Transition(story, toStatus, timeStamp) {
  this.story = story;
  this.toStatus = toStatus;
  this.timeStamp = timeStamp;
}

// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
function Story(storyLine) {
  const storyFields = storyLine.split(';');

  if (storyFields[0] == '') {
    // TODO: Throw some error here
  }

  // Initiate the properties of the story
  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  this.transitions = [];

  this.status = statuses[UNCREATED_STATUS_ID];
  this.status.storiesInStatus.push(this);
  this.verticalSlot = UNCREATED_SLOT;
  this.elements = canvas.group();

  this.elements.translate(UNCREATED_STATUS_X, UNCREATED_STATUS_Y);

  // this.elements.translate(UNCREATED_STATUS_X, UNCREATED_STATUS_Y);
  // this.elements.attr({ x: UNCREATED_STATUS_X, y: UNCREATED_STATUS_Y });
  // this.elements.x(UNCREATED_STATUS_X);
  // this.elements.y(UNCREATED_STATUS_Y);
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

  // Create the transitions and push them onto the transitions array
  for (var fieldNo = 3; fieldNo < storyFields.length; fieldNo++) {
    if (storyFields[fieldNo] != '') {
      const transition = new Transition(
        this,
        statuses[fieldNo - 2],
        stringToDate(storyFields[fieldNo], DATE_FORMAT)
      );

      transitions.push(transition);
    }
  }
}

// Parse the first line of the input file holding the statuses
// and create status objects for each encountered status
const addStatuses = statusLine => {
  uncreatedStatus = new Status('Uncreated', UNCREATED_STATUS_X);
  statuses.push(uncreatedStatus);
  var fields = statusLine.split(';');
  const statusWidth = (canvas.width() - MARGIN) / (fields.length - 3) - MARGIN;

  for (var fieldNo = 3; fieldNo < fields.length; fieldNo++) {
    const statusCenter =
      MARGIN + (fieldNo - 3) * (statusWidth + MARGIN) + statusWidth / 2;

    const status = new Status(fields[fieldNo], statusCenter);

    statuses.push(status);
    status.text.text(fields[fieldNo]);
    status.text.move(statusCenter, STATUS_LABELS_Y);
    status.text.width = statusWidth;
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
    story.transitions.length = 0;
    story.elements.remove();
    story.tooltip.remove();
    story = null;
  });
  storyCollection.length = 0;
  transitions.forEach(transition => {
    transition = null;
  });
  transitions.length = 0;
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
    var contents = e.target.result;

    clearPreviousProject(); // Now's the time to clear the previous project
    var lines = contents.match(/[^\r\n]+/g);

    addStatuses(lines[0]); // Read and create statuses from first line in file

    //  Read and create stories and status transitions from subsequent lines in file
    for (var lineNo = 1; lineNo < lines.length; lineNo++) {
      const story = new Story(lines[lineNo]);
      storyCollection.push(story);
    }

    // Launch the building of the animation based on the status transitions
    buildAnimation();
    btnPlay.activate();
    btnStop.activate();
  };

  // Done preparing the FileReader, now time to execute it
  reader.readAsText(file);
}

// Event handler getting triggered after the user has selected a file
// in the file open dialog
input.onchange = e => {
  file = e.target.files[0];
  if (!file) return;

  // Launch the reading of stories and transitions from the file that
  // the user selected
  readStoriesAndTransitionsFromFile(file);
  // clear the value of the file open element so that next time the onchange
  // event will be triggered also when the user selects the same file again
  input.value = '';
};

// give the x coordinate on the canvas of a status #
function statusToXCoord(status) {
  return status.center - TOKEN_WIDTH / 2;
}

// give the y coordinate on the canvas of a vertical slot #
function slotToYCoord(slot) {
  return STATUS_LABELS_Y - MARGIN - slot * TOKEN_WIDTH - TOKEN_WIDTH / 2;
}

// Build the animation timeline with the stories' status transitions
// based on the status transitions in the transitions object
function buildAnimation() {
  // Sort the newly created transitions based on timestamp
  transitions.sort((firstEl, secondEl) => {
    if (firstEl.timeStamp < secondEl.timeStamp) {
      return -1;
    } else if (firstEl.timeStamp > secondEl.timeStamp) {
      return 1;
    } else {
      return 0;
    }
  });
  // Determine the timespan of the transitions from first to last -- since they
  // were just sorted by timestamp, we can find the first transition as the
  // first element in the Array and the last one as the last element
  firstTransitionTime = transitions[0].timeStamp.getTime();
  lastTransitionTime = transitions[transitions.length - 1].timeStamp.getTime();
  projectDuration =
    (lastTransitionTime - firstTransitionTime) *
    (ANIMATION_DURATION / (ANIMATION_DURATION - TRANSITION_DURATION));
  factor = ANIMATION_DURATION / SLIDER_FULL_LENGTH;

  const itemsToProcess = transitions.length;

  function setIntervalAsync(fn, ms) {
    fn().then(promiseResponse => {
      if (!promiseResponse.done) {
        setTimeout(() => setIntervalAsync(fn, ms), ms);
      }
    });
  }

  const animationGenerator = AnimationGenerator();
  setIntervalAsync(async () => {
    return animationGenerator.next();
  }, 0);
}

function* AnimationGenerator() {
  for (var i = 0; i < transitions.length; i++) {
    var transition = transitions[i];
    const storyToMove = transition.story;
    const fromStatus = storyToMove.status;
    var fromSlot = storyToMove.verticalSlot;
    const toStatus = transition.toStatus;
    toStatus.storiesInStatus.push(storyToMove);
    const toSlot = toStatus.storiesInStatus.length - 1;

    // Make new stories fly in vertically by positioning them
    // on the height of their destination slot
    if (fromStatus == uncreatedStatus) {
      fromSlot = toSlot;
      storyToMove.elements.translate(0, slotToYCoord(toSlot));
    }

    const pointOnTimeline =
      ((transition.timeStamp.getTime() - firstTransitionTime) /
        projectDuration) *
      ANIMATION_DURATION;

    // console.log(
    //   'Moving ' +
    //     storyToMove.id +
    //     ' from ' +
    //     fromStatus.name +
    //     '/' +
    //     fromSlot +
    //     ' to ' +
    //     toStatus.name +
    //     '/' +
    //     toSlot +
    //     ' at ' +
    //     Math.round(pointOnTimeline)
    // );

    storyToMove.elements
      .timeline(timeline)
      .animate(TRANSITION_DURATION, pointOnTimeline, 'absolute')
      .translate(
        statusToXCoord(toStatus) - statusToXCoord(fromStatus),
        slotToYCoord(toSlot) - slotToYCoord(fromSlot)
      );
    // .move(statusToXCoord(toStatus), slotToYCoord(toSlot));
    storyToMove.status = toStatus;
    storyToMove.verticalSlot = toSlot;

    fromStatus.storiesInStatus.splice(fromSlot, 1);

    const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);

    if (fromStatus != uncreatedStatus) {
      // No need to perform drop operation on stories in uncreated status
      storiesToDrop.forEach(storyToDrop => {
        const dropFromSlot = storyToDrop.verticalSlot;
        const dropToSlot = storyToDrop.verticalSlot - 1;
        storyToDrop.elements
          .timeline(timeline)
          .animate(DROP_DURATION, pointOnTimeline, 'absolute')
          .translate(0, slotToYCoord(dropToSlot) - slotToYCoord(dropFromSlot));
        // .y(slotToYCoord(dropToSlot));
        storyToDrop.verticalSlot = dropToSlot;
      });
    }
    // const endTime = timeline.getEndTime();
    const endTime = pointOnTimeline + TRANSITION_DURATION;
    sliderLine.width((endTime / ANIMATION_DURATION) * SLIDER_FULL_LENGTH);
    if (!animationPlaying) {
      timeline.pause();
    }
    yield;
  }

  return '';
}

/*****************************************************************
  BUTTONS
*****************************************************************/

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

/*****************************************************************
  SLIDER
*****************************************************************/

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

  if (x > CANVAS_WIDTH - SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2) {
    x = CANVAS_WIDTH - SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2;
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

  // Put our internal playing status to false if the last runner has completed
  // i.e. we have reached the end of the timeline
  if (timeline.isDone()) {
    animationPlaying = false;
  }
});
