// import * as SVG from './node_modules/svg.js/dist/svg.js';

('use strict');
// console.log('Starting index.js...');

const TOKEN_WIDTH = 10;
const BUTTON_WIDTH = 40;
const MARGIN = 10;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
const STATUS_LABELS_Y = 450;
const UNCREATED_STATUS_X = -15;
const UNCREATED_STATUS_ID = 0;
const DATE_FORMAT = 'dd.mm.yyyy';

// create SVG document and set its size
const mainCanvas = SVG('svg');
// console.log(canvas);
mainCanvas.size(CANVAS_WIDTH, CANVAS_HEIGHT);
const tokenCanvas = mainCanvas.group();
const labelCanvas = mainCanvas.group();
// // console.log(canvas);
var background = mainCanvas.rect('100%', '100%').fill('#97F9F9');
// // console.log(background);
const timeline = new SVG.Timeline().persist(true);
// window.onresize = () => // console.log(canvas);

const readStories = () => {
  // console.log('readStories executed...');
  input.click();
};

var input = document.createElement('input');
input.type = 'file';
var file;

const storyCollection = [];
const transitions = [];

const statuses = [];

function Status(name, center) {
  this.name = name;
  this.center = center;
  this.storiesInStatus = [];
  this.text = null;
}

const addStatuses = statusLine => {
  statuses.push(new Status('Uncreated', UNCREATED_STATUS_X));
  var fields = statusLine.split(';');
  // console.log('Split statusLine into the following fields:');
  // console.log(fields);
  // console.log('');
  const statusWidth =
    (mainCanvas.width() - MARGIN) / (fields.length - 3) - MARGIN;

  for (var fieldNo = 3; fieldNo < fields.length; fieldNo++) {
    const statusCenter =
      MARGIN + (fieldNo - 3) * (statusWidth + MARGIN) + statusWidth / 2;

    const status = new Status(fields[fieldNo], statusCenter);

    statuses.push(status);
    status.text = mainCanvas.text(fields[fieldNo]);
    status.text.move(statusCenter, STATUS_LABELS_Y);
    status.text.width = statusWidth;
    status.text.font({
      family: 'Helvetica',
      size: 10,
      anchor: 'middle',
      leading: '1.5em',
    });
  }
  // console.log('Found the following statuses:');
  // console.log(statuses);
  // console.log('');
  // console.log('');
};

function Transition(story, toStatus, timeStamp) {
  this.story = story;
  this.toStatus = toStatus;
  this.timeStamp = timeStamp;
}

function stringToDate(date, format) {
  const delimiter = format.match(/\W/g)[0];
  const formatLowerCase = format.toLowerCase();
  const formatItems = formatLowerCase.split(delimiter);
  const dateItems = date.split(delimiter);
  const monthIndex = formatItems.indexOf('mm');
  const dayIndex = formatItems.indexOf('dd');
  const yearIndex = formatItems.indexOf('yyyy');
  const formatedDate = new Date(
    dateItems[yearIndex],
    dateItems[monthIndex] - 1,
    dateItems[dayIndex]
  );
  return formatedDate;
}

function Story(storyLine) {
  // console.log(storyLine);
  const storyFields = storyLine.split(';');
  // console.log('Split storyline into following fieds:');
  // console.log(storyFields);
  // console.log('');
  // console.log('');
  if ((storyFields[0] = '')) {
    return;
  }
  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  this.transitions = [];
  this.token = {};
  this.status = null;
  this.verticalSlot = null;

  // console.log('Added the following transitions: ');
  for (var fieldNo = 3; fieldNo < storyFields.length; fieldNo++) {
    if (storyFields[fieldNo] != '') {
      const transition = new Transition(
        this,
        statuses[fieldNo - 2],
        stringToDate(storyFields[fieldNo], DATE_FORMAT)
      );
      // console.log('Time stamp of transision: ');
      // console.log(storyFields[fieldNo]);
      // console.log(Date(storyFields[fieldNo]));
      // console.log('');

      transitions.push(transition);
      // console.log(transition);
    }
  }
}

input.onchange = e => {
  file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    // // console.log(e.target.result);
    var contents = e.target.result;

    clearPreviousElements();

    var lines = contents.match(/[^\r\n]+/g);
    // console.log('lines.length: ' + lines.length);
    addStatuses(lines[0]);

    for (var lineNo = 1; lineNo < lines.length; lineNo++) {
      const story = new Story(lines[lineNo]);
      storyCollection.push(story);
    }

    transitions.sort((firstEl, secondEl) => {
      if (firstEl.timeStamp < secondEl.timeStamp) {
        return -1;
      } else if (firstEl.timeStamp > secondEl.timeStamp) {
        return 1;
      } else {
        return 0;
      }
    });
    buildAnimation();
  };
  reader.readAsText(file);
  input.value = '';
};

function statusToXCoord(status) {
  return status.center;
}

function slotToYCoord(slot) {
  return STATUS_LABELS_Y - MARGIN - slot * TOKEN_WIDTH;
}

function buildAnimation() {
  //
  storyCollection.forEach(story => {
    // console.log('story:');
    // console.log(story);
    statuses[UNCREATED_STATUS_ID].storiesInStatus.push(story);
    story.status = statuses[UNCREATED_STATUS_ID];
    story.verticalSlot = statuses[UNCREATED_STATUS_ID].storiesInStatus.indexOf(
      story
    );
    story.token = mainCanvas.circle(TOKEN_WIDTH);
    story.token.timeline(timeline);
    story.token.cx(statusToXCoord(story.status));
    story.token.cy(slotToYCoord(story.verticalSlot));
  });
  transitions.forEach(transition => {
    // console.log('Processing transition');
    // console.log(transition.timeStamp);
    // console.log(transition.story);
    // console.log('Received story ' + transition.story.id);
    const storyToMove = transition.story;
    // console.log('storyToMove:');
    // console.log(storyToMove);

    const fromStatus = storyToMove.status;

    const fromSlot = storyToMove.verticalSlot;
    const toStatus = transition.toStatus;

    // console.log(transition);
    // console.log(toStatus);
    // console.log(statuses[toStatus]);
    toStatus.storiesInStatus.push(storyToMove);
    // console.log('Stories in toStatus: ' + toStatus.storiesInStatus.length);
    const toSlot = toStatus.storiesInStatus.length - 1;

    // console.log('Moving story ' + storyToMove.id);
    // console.log('from status ' + fromStatus.name + ', slot ' + fromSlot);
    // console.log('to status ' + toStatus.name + ', slot ' + toSlot);

    storyToMove.token
      .animate(200)
      .center(statusToXCoord(toStatus), slotToYCoord(toSlot));
    storyToMove.status = toStatus;
    storyToMove.verticalSlot = toSlot;

    // console.log('');
    // console.log('Before splice...');
    // console.log(fromStatus.storiesInStatus);
    fromStatus.storiesInStatus.splice(fromSlot, 1);
    // console.log('');
    // console.log('After splice...');
    // console.log(fromStatus.storiesInStatus);
    // console.log('');
    const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);
    storiesToDrop.forEach(storyToDrop => {
      //
      const dropToSlot = storyToDrop.verticalSlot - 1;
      storyToDrop.token.animate(80).cy(slotToYCoord(dropToSlot));
      storyToDrop.verticalSlot = dropToSlot;
    });
    // console.log('');
    // console.log('');
  });
}

const controls = mainCanvas.group().translate(MARGIN, MARGIN);

const open = controls.group();
open.circleElement = open.circle(BUTTON_WIDTH);
open.circleElement.fill('#FFFFFF').stroke({
  color: '#00AABB',
  width: 1,
  opacity: 0.3,
});

const openIcon = open.group();
openIcon.polygon([0, 10, 20, 10, 10, 0]);
openIcon.line([0, 15, 20, 15]).stroke({ width: 3, color: 'black' });
openIcon.center(20, 18);

open.on('click', () => {
  readStories();
});

open.on('mouseover', function() {
  this.circleElement.fill({ color: '#F8F9FB' });
});

open.on('mousedown', function() {
  this.circleElement.fill({ color: '#E8E7ED' });
});

open.on('mouseup', function() {
  this.circleElement.fill({ color: '#F8F9FB' });
});

open.on('mouseout', function() {
  this.circleElement.fill({ color: '#FFFFFF' });
});

function clearPreviousElements() {
  console.log('Executing clearPreviousElements');
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
}
