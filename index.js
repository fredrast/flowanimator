// import * as SVG from './node_modules/svg.js/dist/svg.js';
'use strict';

import { BUTTON_WIDTH, Button } from './button.js';
import { stringToDate } from './utils.js';

// Global constants
const TOKEN_WIDTH = 20;
const MARGIN = 10;
const SLIDER_HEIGHT = 80;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const STATUS_LABELS_Y = CANVAS_HEIGHT - SLIDER_HEIGHT - MARGIN;
const UNCREATED_STATUS_X = -15;
const UNCREATED_STATUS_ID = 0;
const DATE_FORMAT = 'dd.mm.yyyy';
const DURATION_LENGTH = 10000;
const SLIDER_MARGIN = 40;
const SLIDER_BUTTON_RADIUS = 32;

// Global variables -- shame on me!! ;-)
var factor;
var sliderLineLength;
const storyCollection = [];
const transitions = [];
const statuses = [];
var file;

// Create drawing canvas and paint the background
const canvas = SVG('svg');
canvas.size(CANVAS_WIDTH, CANVAS_HEIGHT);
var background = canvas.rect('100%', '100%').fill('#97F9F9');

// Timeline for animation
const timeline = new SVG.Timeline().persist(true);

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
    return;
  }

  // Initiate the properties of the story
  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  this.transitions = [];
  this.token = {};
  this.tooltip = {};
  this.status = null;
  this.verticalSlot = null;

  this.status = statuses[UNCREATED_STATUS_ID];
  this.status.storiesInStatus.push(this);
  this.verticalSlot = this.status.storiesInStatus.indexOf(this);
  this.token = canvas.circle(TOKEN_WIDTH);
  this.token.timeline(timeline);
  this.token.cx(statusToXCoord(this.status));
  this.token.cy(slotToYCoord(this.verticalSlot));
  this.tooltip = canvas.text(this.id);

  this.tooltip.hide();
  this.token.on('mouseover', e => {
    this.tooltip.show();
    this.tooltip.move(this.token.x() + TOKEN_WIDTH + MARGIN, this.token.y());
  });
  this.token.on('mouseout', e => {
    this.tooltip.hide();
  });
  console.log('Created  ' + this.name);

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
  statuses.push(new Status('Uncreated', UNCREATED_STATUS_X));
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
    story = null;
  });
  storyCollection.length = 0;
  transitions.forEach(transition => {
    transition = null;
  });
  transitions.length = 0;
  sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);

  timeline._runners.length = 0;
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
  return status.center;
}

// give the y coordinate on the canvas of a vertical slot #
function slotToYCoord(slot) {
  return STATUS_LABELS_Y - MARGIN - slot * TOKEN_WIDTH;
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
  const firstTransitionTime = transitions[0].timeStamp.getTime();
  const lastTransitionTime = transitions[
    transitions.length - 1
  ].timeStamp.getTime();
  const transitionsDuration = lastTransitionTime - firstTransitionTime;

  const itemsToProcess = storyCollection.length + transitions.length;

  storyCollection.forEach(story => {});

  transitions.forEach(transition => {
    const storyToMove = transition.story;
    const fromStatus = storyToMove.status;
    const fromSlot = storyToMove.verticalSlot;
    const toStatus = transition.toStatus;
    toStatus.storiesInStatus.push(storyToMove);
    const toSlot = toStatus.storiesInStatus.length - 1;

    console.log(storyToMove.name);

    const pointOnTimeline =
      ((transition.timeStamp.getTime() - firstTransitionTime) /
        transitionsDuration) *
      DURATION_LENGTH;

    storyToMove.token
      .timeline(timeline)
      .animate(200, pointOnTimeline, 'absolute')
      .center(statusToXCoord(toStatus), slotToYCoord(toSlot));
    storyToMove.status = toStatus;
    storyToMove.verticalSlot = toSlot;

    fromStatus.storiesInStatus.splice(fromSlot, 1);

    const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);
    storiesToDrop.forEach(storyToDrop => {
      const dropToSlot = storyToDrop.verticalSlot - 1;
      storyToDrop.token
        .timeline(timeline)
        .animate(80, pointOnTimeline, 'absolute')
        .cy(slotToYCoord(dropToSlot));
      storyToDrop.verticalSlot = dropToSlot;
    });

    timeline.pause();
    const endTime = timeline.getEndTime();
    factor = endTime / sliderLineLength;

    return '';
  });
}

// Create and position the controls and set their click handlers

const open = new Button('open', canvas, MARGIN, MARGIN, () => {
  input.click();
});

const play = new Button(
  'play',
  canvas,
  MARGIN * 2 + BUTTON_WIDTH,
  MARGIN,
  () => {
    if (timeline._paused) return timeline.play();
    timeline.pause();
  }
);

const stop = new Button(
  'stop',
  canvas,
  MARGIN * 3 + BUTTON_WIDTH * 2,
  MARGIN,
  () => {
    timeline.stop();
    sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
  }
);

const sliderLine = canvas
  .line(
    SLIDER_MARGIN,
    CANVAS_HEIGHT - MARGIN - SLIDER_HEIGHT / 2,
    CANVAS_WIDTH - SLIDER_MARGIN,
    CANVAS_HEIGHT - MARGIN - SLIDER_HEIGHT / 2
  )
  .stroke({
    color: 'black',
    width: 15,
    opacity: 0.5,
  });

sliderLineLength = CANVAS_WIDTH - 2 * SLIDER_MARGIN;

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
sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
sliderButton.cy(CANVAS_HEIGHT - MARGIN - SLIDER_HEIGHT / 2);
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

  handler.move(
    x,
    CANVAS_HEIGHT - MARGIN - SLIDER_HEIGHT / 2 - SLIDER_BUTTON_RADIUS / 2
  );
});

timeline.on('time', e => {
  var x = e.detail / factor + SLIDER_MARGIN;
  if (x > sliderLineLength + SLIDER_MARGIN) {
    x = sliderLineLength + SLIDER_MARGIN;
  }

  sliderButton.cx(x);
});
