import { Button } from './button.js';

export function Ui(timeline) {
  /****************************************************************************
                      COMMON CONSTANTS AND VARIABLES
   ****************************************************************************/
  const MARGIN = 10;
  const CANVAS_MIN_WIDTH = 700;
  const SLIDER_MARGIN = 40;
  const SLIDER_MIN_WIDTH = CANVAS_MIN_WIDTH - 2 * SLIDER_MARGIN;
  const SLIDER_MAX_WIDTH = 1200;
  const CANVAS_LEFT = 0;
  const CANVAS_BOTTOM = 0;
  const BUTTON_WIDTH = 40;
  const SLIDER_FULL_LENGTH = window.innerWidth - 2 * SLIDER_MARGIN;
  const CONTROLS_Y = CANVAS_BOTTOM - 3 * MARGIN - BUTTON_WIDTH;
  const SLIDER_BUTTON_RADIUS = 32;
  const SLIDER_LINE_WIDTH = 15;
  const SLIDER_CY = CONTROLS_Y - MARGIN - SLIDER_BUTTON_RADIUS / 2;
  const STATUS_LABELS_Y = CONTROLS_Y - 2.5 * MARGIN - SLIDER_BUTTON_RADIUS;

  const TOKEN_WIDTH = 20;
  const UNCREATED_STATUS_X = -100;
  const UNCREATED_STATUS_Y = -100;

  var zoomFactor = 1;

  this.animationPlaying = false;

  this.factor = 0; // Factor to represent the ratio of animation duration to slider length
  // TODO what would be the best initial value? Not necessarily 0.

  this.setFunctionToProcessFile = function(processFile) {
    this.processFile = processFile;
  };

  /******************************************************************************/
  /*           CANVAS AND BACKGROUND                                            */
  /******************************************************************************/

  // Create drawing canvas and paint the background
  this.canvas = SVG('svg');
  this.canvas.size(window.innerWidth, window.innerHeight);
  this.canvas.viewbox({
    x: CANVAS_LEFT,
    y: CANVAS_BOTTOM - window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const background = this.canvas
    .rect(window.innerWidth, window.innerHeight)
    .fill('#97F9F9');

  const controls = this.canvas
    .group()
    .translate(
      SLIDER_MARGIN + SLIDER_FULL_LENGTH / 2 - 2.5 * BUTTON_WIDTH - 2 * MARGIN,
      CONTROLS_Y
    );

  const dateText = this.canvas.text('Date goes here');
  dateText.x(this.canvas.viewbox().x + SLIDER_MARGIN);
  dateText.cy(CONTROLS_Y + BUTTON_WIDTH / 2);
  dateText.font({
    family: 'Helvetica',
    size: 12,
    anchor: 'right',
    leading: '1.5em',
  });

  this.setAnimationDate = date => {
    dateText.clear();
    dateText.text(
      new Intl.DateTimeFormat('fi-FI', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date)
    );
  };

  const canvasResize = () => {
    this.canvas.size(window.innerWidth, window.innerHeight);

    const deltaX = window.innerWidth * zoomFactor - this.canvas.viewbox().width;

    this.canvas.viewbox({
      x: this.canvas.viewbox().x - deltaX / 2,
      y: CANVAS_BOTTOM - window.innerHeight * zoomFactor,
      width: window.innerWidth * zoomFactor,
      height: window.innerHeight * zoomFactor,
    });

    background.size(this.canvas.viewbox().width, this.canvas.viewbox().height);
    background.move(this.canvas.viewbox().x, this.canvas.viewbox().y);
  };

  window.addEventListener('resize', canvasResize);
  canvasResize();

  /****************************************************************************
                    RESET UI WHEN LOADING NEW PROJECT
   ****************************************************************************/

  this.reset = () => {
    sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
    this.setAnimationLoad(0);
    this.animationPlaying = false;
  };

  /******************************************************************************/
  /*                     COORDINATE TRANSLATIONS                                */
  /******************************************************************************/

  // give the x coordinate on the canvas of a status #
  this.statusToXCoord = status => {
    return status.center - TOKEN_WIDTH / 2;
  };

  // give the y coordinate on the canvas of a vertical slot #
  this.slotToYCoord = slot => {
    return STATUS_LABELS_Y - 3 * MARGIN - slot * TOKEN_WIDTH - TOKEN_WIDTH / 2;
  };

  /******************************************************************************/
  /*                                 INPUT                                   */
  /******************************************************************************/

  // Input element for invoking file open dialog for selecting input file
  var input = document.createElement('input');
  input.type = 'file';

  // Event handler getting triggered after the user has selected a file
  // in the file open dialog
  input.onchange = e => {
    // /* console.log('input.onchange fired'); */
    const file = e.target.files[0];
    if (!file) return;

    // Launch the reading of stories and transitions from the file that
    // the user selected
    if (this.processFile(file)) {
      // If the file was successfully read, we should activate the control buttons
      ui.btnPlay.activate();
      ui.btnStop.activate();
    }
    // clear the value of the file open element so that next time the onchange
    // event will be triggered also when the user selects the same file again
    input.value = '';
  };

  //***************************************************************************
  //                            STATUSES
  //***************************************************************************

  this.addStatuses = function(statuses) {
    const statusesWidth = window.innerWidth - 2 * SLIDER_MARGIN;
    const statusCount = statuses.length - 1; // One less than the number of statuses on the array, since we are not counting with the first UNCREATED status
    const statusSpacing = // the maximum space that one status label can afford to occupy
      (statusesWidth - (statusCount - 1) * MARGIN) / statusCount;

    for (var statusNr = 0; statusNr < statuses.length; statusNr++) {
      const status = statuses[statusNr];
      if (statusNr == 0) {
        // the UNCREATED status requires different treatment as it should not be displayed on the screen
        status.center = UNCREATED_STATUS_X;
      } else {
        const statusCenter =
          SLIDER_MARGIN +
          (statusNr - 1) * (statusSpacing + MARGIN) +
          statusSpacing / 2;
        status.center = statusCenter;
        status.text = this.canvas.text(status.name);

        status.text.font({
          family: 'Helvetica',
          size: 12,
          anchor: 'start',
          leading: '1.1em',
          weight: 'bold',
        });

        if (status.text.bbox().width > statusSpacing) {
          status.text.text(divide(status.text.text()));
        }

        status.text.center(statusCenter, STATUS_LABELS_Y);
      }
    }
  };

  function divide(text) {
    // thanks to Tim Down on https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript?answertab=votes#tab-top
    const regex = /\s/gi;
    var result;
    const spaceIndices = [];
    while ((result = regex.exec(text))) {
      spaceIndices.push(result.index);
    }

    /* console.log('spaceIndices:'); */
    /* console.log(spaceIndices); */

    var minDistanceFromMiddle;
    var spaceNearestMiddle;

    for (var i = 0; i < spaceIndices.length; i++) {
      const distanceFromMiddle = Math.abs(spaceIndices[i] - text.length / 2);
      /* console.log('!minDistanceFromMiddle: ' + !minDistanceFromMiddle); */
      if (
        !minDistanceFromMiddle ||
        distanceFromMiddle < minDistanceFromMiddle
      ) {
        minDistanceFromMiddle = distanceFromMiddle;
        spaceNearestMiddle = spaceIndices[i];
        /* console.log('spaceIndices[i]: ' + spaceIndices[i]); */
        /* console.log('distanceFromMiddle: ' + distanceFromMiddle); */
        /* console.log('minDistanceFromMiddle: ' + minDistanceFromMiddle); */
      }
    }

    if (spaceNearestMiddle) {
      return (
        text.substring(0, spaceNearestMiddle) +
        '\n' +
        text.substring(spaceNearestMiddle + 1, text.length)
      );
    } else {
      return text;
    }
  }

  /****************************************************************************
                                 TOKEN
   ****************************************************************************/

  this.getToken = function(story) {
    const token = {};
    token.elements = this.canvas.nested();
    token.elements.timeline(timeline);
    token.elements.move(UNCREATED_STATUS_X, UNCREATED_STATUS_Y);
    token.circle = token.elements.circle(TOKEN_WIDTH);
    token.tooltip = token.elements.text(story.id);
    token.tooltip.font({
      family: 'Helvetica',
      size: 10,
      anchor: 'left',
      leading: '1.5em',
      fill: '#053569',
    });
    token.tooltip.x(TOKEN_WIDTH + MARGIN / 2);

    token.tooltip.show();
    token.circle.on('mouseover', e => {
      token.tooltip.show();
      // this.tooltip.move(this.token.x() + TOKEN_WIDTH + MARGIN, this.token.y());
    });
    token.circle.on('mouseout', e => {
      // token.tooltip.hide();
    });

    token.clear = function() {
      this.circle.remove();
      this.tooltip.remove();
      this.elements.remove();
    };

    return token;
  };
  /******************************************************************************/
  /*                                 BUTTONS                                    */
  /******************************************************************************/

  // Create and position the controls and set their click handlers

  const btnOpen = new Button('open', this.canvas, 0, 0, BUTTON_WIDTH, () => {
    input.click();
  });
  btnOpen.activate();
  controls.add(btnOpen.elements);

  const btnPlay = new Button(
    'play',
    this.canvas,
    MARGIN + BUTTON_WIDTH,
    0,
    BUTTON_WIDTH,
    () => {
      if (this.animationPlaying) {
        timeline.pause();
        this.animationPlaying = false;
      } else {
        // start playing from the beginning if we were at the end of the timeline
        if (timeline.isDone()) {
          timeline.time(0);
        }
        timeline.play();
        this.animationPlaying = true;
      }
    }
  );

  controls.add(btnPlay.elements);

  const btnStop = new Button(
    'stop',
    this.canvas,
    MARGIN * 2 + BUTTON_WIDTH * 2,
    0,
    BUTTON_WIDTH,
    () => {
      timeline.stop();
      this.animationPlaying = false;
      sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
    }
  );
  controls.add(btnStop.elements);

  const btnZoomOut = new Button(
    'scale',
    this.canvas,
    MARGIN * 3 + BUTTON_WIDTH * 3,
    0,
    BUTTON_WIDTH,
    () => {
      zoomFactor = zoomFactor * 1.25;
      canvasResize();
    }
  );
  btnZoomOut.activate();
  controls.add(btnZoomOut.elements);

  const btnZoomIn = new Button(
    'scale',
    this.canvas,
    MARGIN * 4 + BUTTON_WIDTH * 4,
    0,
    BUTTON_WIDTH,
    () => {
      zoomFactor = zoomFactor * 0.8;
      canvasResize();
    }
  );
  btnZoomIn.activate();
  controls.add(btnZoomIn.elements);

  this.enablePlayControls = () => {
    btnPlay.activate();
    btnStop.activate();
    sliderLine.on('click', sliderLineClick);
    sliderButton.on('dragmove.namespace', sliderButtonDragActive);
  };

  /******************************************************************************
                                PROGRESS BAR
   ******************************************************************************/

  const sliderBackground = this.canvas
    .line(
      SLIDER_MARGIN,
      SLIDER_CY,
      SLIDER_MARGIN + SLIDER_FULL_LENGTH,
      SLIDER_CY
    )
    .stroke({
      color: 'white',
      width: SLIDER_LINE_WIDTH,
      opacity: 1,
      linecap: 'round',
    });

  const sliderLine = this.canvas
    .line(SLIDER_MARGIN, SLIDER_CY, SLIDER_MARGIN + 1, SLIDER_CY)
    .stroke({
      color: 'black',
      width: SLIDER_LINE_WIDTH,
      opacity: 0.5,
      linecap: 'round',
    });

  this.theSliderLine = sliderLine;

  const sliderLineClick = e => {
    const factor = this.factor;
    const { x } = sliderLine.point(e.pageX, e.pageY);
    const progress = x - SLIDER_MARGIN;

    timeline.time(Math.round(progress * factor));

    sliderButton.cx(x);
  };

  const sliderButton = this.canvas.circle(SLIDER_BUTTON_RADIUS);
  sliderButton.fill({
    color: 'black',
    opacity: 0.8,
  });
  sliderButton.x(CANVAS_LEFT + SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
  sliderButton.cy(SLIDER_CY);
  sliderButton.draggable();

  this.setAnimationDuration = animationDuration => {
    this.factor = animationDuration / SLIDER_FULL_LENGTH;
  };

  this.setAnimationLoad = function(percentage) {
    var newWidth = Math.round(Math.min(percentage, 1) * SLIDER_FULL_LENGTH);
    sliderLine.plot(
      SLIDER_MARGIN,
      SLIDER_CY,
      SLIDER_MARGIN + newWidth,
      SLIDER_CY
    );
  };

  this.setProgressBar = percentage => {
    sliderButton.cx(
      CANVAS_LEFT + SLIDER_MARGIN + Math.min(percentage, 1) * SLIDER_FULL_LENGTH
    );
  };

  const sliderButtonDragActive = e => {
    //employed when animation is loaded and controls should be active
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

    timeline.time(Math.round(progress * this.factor));

    handler.move(x, SLIDER_CY - SLIDER_BUTTON_RADIUS / 2);
  };
  const sliderButtonDragInactive = e => {
    //employed when animation is not loaded and controls should not be active
    e.preventDefault();
  };

  sliderButton.on('dragmove.namespace', sliderButtonDragInactive); // start by loading the inactive handler
}
