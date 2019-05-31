console.log('Starting index.js...');

// create SVG document and set its size
var canvas = SVG('canvas-div').size(1000, 500);
// console.log(canvas);
var background = canvas.rect('100%', '100%').fill('#97F9F9');
// console.log(background);

// window.onresize = () => console.log(canvas);

const readStories = () => {
  console.log('readStories executed...');
  input.click();
};

var input = document.createElement('input');
input.type = 'file';
var file;

const storyCollection = [];
const statusTransitions = [];

const statuses = [];

const addStatuses = line => {
  console.log('Line: ' + line);
  var fields = line.split(';');
  console.log('Fields: ' + fields);
  const margin = 10;
  const statusWidth = (canvas.width() - margin) / (fields.length - 3) - margin;
  console.log('fields.length: ' + fields.length);
  console.log('canvas.width: ' + canvas.width());
  console.log('statusWidth: ' + statusWidth);

  for (var fieldNo = 3; fieldNo < fields.length; fieldNo++) {
    statuses.push(fields[fieldNo]);
    console.log(fields[fieldNo]);
    const text = canvas.text(fields[fieldNo]);

    text.move(margin + (statusWidth + margin) * (fieldNo - 3), 450);
    text.width = statusWidth;
    console.log(text);
  }
  console.log('Found the following statuses:');
  console.log(statuses);
};

function StatusTransition(storyID, toState, timeStamp) {
  this.storyID = storyID;
  this.toState = toState;
  this.timeStamp = timeStamp;
}

function Story(storyLine) {
  console.log(storyLine);
  const storyFields = storyLine.split(';');
  this.ID = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  this.transitions = [];
  for (var fieldNo = 3; fieldNo < storyFields.length; fieldNo++) {
    if (storyFields[fieldNo] != '') {
      const statusTransition = new StatusTransition(
        this.ID,
        statuses[fieldNo - 3],
        storyFields[fieldNo]
      );
      // this.transitions.push(statusTransition);
      statusTransitions.push(statusTransition);
    }
  }
}

input.onchange = e => {
  file = e.target.files[0];
  // console.log(file);
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    // console.log(e.target.result);
    var contents = e.target.result;

    var lines = contents.match(/[^\r\n]+/g);
    console.log('lines.length: ' + lines.length);
    addStatuses(lines[0]);

    for (var lineNo = 1; lineNo < lines.length; lineNo++) {
      storyCollection.push(new Story(lines[lineNo]));
    }
    console.log(storyCollection);
    buildAnimation();
  };
  reader.readAsText(file);
};

function buildAnimation() {
  //
}

const controls = canvas.group().translate(10, 10);

const open = controls.group();
open.circleElement = open.circle(40);
open.circleElement.fill('#FFFFFF');

/* .stroke({
  color: '#00AABB',
  width: 1,
  opacity: 0.3*,
})*/

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
