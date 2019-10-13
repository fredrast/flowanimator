import { Button } from './button.js';
import { msToTime } from './utils.js';
import { getBoardsFromJira } from './jira.js';

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
  const SLIDER_BUTTON_RADIUS = 30;
  const SLIDER_LINE_WIDTH = 15;
  const SLIDER_CY = CONTROLS_Y - 60 - SLIDER_BUTTON_RADIUS / 2;
  const COLUMN_LABELS_Y = SLIDER_CY - SLIDER_BUTTON_RADIUS / 2 - 2 * MARGIN;

  const CALENDAR_TIMELINE_TOP = SLIDER_CY + SLIDER_LINE_WIDTH / 2 + 10;
  const CALENDAR_TIMELINE_BOTTOM = CONTROLS_Y - MARGIN;
  const CALENDAR_TIMELINE_LEFT = SLIDER_MARGIN;
  const CALENDAR_TIMELINE_RIGHT = CALENDAR_TIMELINE_LEFT + SLIDER_FULL_LENGTH;
  const CALENDAR_TIMELINE_WIDTH =
    CALENDAR_TIMELINE_RIGHT - CALENDAR_TIMELINE_LEFT;

  const SLIDER_COLOR = '#FFFFFF';

  const TOKEN_WIDTH = 20;
  const UNCREATED_COLUMN_X = -100;
  const UNCREATED_COLUMN_Y = -100;

  var zoomFactor = 1;

  this.projectLoaded = false;
  this.animationPlaying = false;

  this.factor = 0; // Factor to represent the ratio of animation duration to slider length
  // TODO what would be the best initial value? Not necessarily 0.

  // Setting the function to read the file selected by the user;
  // This function is set in index.js but defined in animation.js
  // where the neccesary logic and parameters reside.
  this.setReadProjectDataFromFile = function(readProjectDataFromFile) {
    this.readProjectDataFromFile = readProjectDataFromFile;
  };

  this.setReadProjectDataFromJira = function(readProjectDataFromJira) {
    this.readProjectDataFromJira = readProjectDataFromJira;
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

  const controls = this.canvas
    .group()
    .translate(
      SLIDER_MARGIN + SLIDER_FULL_LENGTH / 2 - 2.5 * BUTTON_WIDTH - 2 * MARGIN,
      CONTROLS_Y
    );

  const dateText = this.canvas.text(' ');
  dateText.x(this.canvas.viewbox().x + SLIDER_MARGIN);
  dateText.cy(CONTROLS_Y + 3 * MARGIN);

  const animationTimeText = this.canvas.text(' ');
  animationTimeText.x(this.canvas.viewbox().x + SLIDER_MARGIN);
  animationTimeText.cy(CONTROLS_Y + MARGIN);

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

  this.setAnimationTime = timestamp => {
    animationTimeText.text(msToTime(timestamp));
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

    // background.size(this.canvas.viewbox().width, this.canvas.viewbox().height);
    // background.move(this.canvas.viewbox().x, this.canvas.viewbox().y);
  };

  window.addEventListener('resize', canvasResize);
  canvasResize();

  /****************************************************************************
                    RESET UI WHEN LOADING NEW PROJECT
   ****************************************************************************/

  this.reset = () => {
    timeline.pause();
    sliderButton.x(SLIDER_MARGIN - SLIDER_BUTTON_RADIUS / 2);
    this.setAnimationLoad(0);
    this.animationPlaying = false;
    this.projectLoaded = false;
  };

  /******************************************************************************/
  /*                     COORDINATE TRANSLATIONS                                */
  /******************************************************************************/

  // give the x coordinate on the canvas of a column #
  this.columnToXCoord = column => {
    return column.center - TOKEN_WIDTH / 2;
  };

  // give the y coordinate on the canvas of a vertical slot #
  this.slotToYCoord = slot => {
    return COLUMN_LABELS_Y - 3 * MARGIN - slot * TOKEN_WIDTH - TOKEN_WIDTH / 2;
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

    // Reset animation and progress bar and disable controls until new file successfully read
    this.reset();
    this.disablePlayControls();
    // Launch the reading of stories and transitions from the file that
    // the user selected
    if (this.readProjectDataFromFile(file)) {
      // If the file was successfully read, we should activate the control buttons
      this.enablePlayControls();
    }

    // clear the value of the file open element so that next time the onchange
    // event will be triggered also when the user selects the same file again
    input.value = '';
  };

  //***************************************************************************
  //                            COLUMNS
  //***************************************************************************

  this.addColumns = function(columnArray) {
    const columnsWidth = window.innerWidth - 2 * SLIDER_MARGIN;
    const displayedColumnCount = columnArray.length - 1; // One less than the number of columns on the array, since we are not counting with the first UNCREATED column
    const columnSpacing = // the maximum space that one column label can afford to occupy
      (columnsWidth - (displayedColumnCount - 1) * MARGIN) /
      displayedColumnCount;

    for (var columnNr = 0; columnNr < columnArray.length; columnNr++) {
      const column = columnArray[columnNr];
      if (columnNr == 0) {
        // the UNCREATED column requires different treatment as it should not be displayed on the screen
        column.center = UNCREATED_COLUMN_X;
      } else {
        const columnCenter =
          SLIDER_MARGIN +
          (columnNr - 1) * (columnSpacing + MARGIN) +
          columnSpacing / 2;
        column.center = columnCenter;
        column.text = this.canvas.text(column.name);
        column.text.addClass('column-label');

        if (column.text.bbox().width > columnSpacing) {
          column.text.text(divide(column.text.text()));
        }

        column.text.center(columnCenter, COLUMN_LABELS_Y);
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
    token.elements.move(UNCREATED_COLUMN_X, UNCREATED_COLUMN_Y);
    token.circle = token.elements.circle(TOKEN_WIDTH);
    token.circle.timeline(timeline);
    token.circle.fill('#fff');
    token.tooltip = token.elements.text(story.id);
    token.tooltip.addClass('tooltip');
    token.tooltip.x(TOKEN_WIDTH + MARGIN / 2);

    // token.tooltip.show();
    token.circle.on('mouseover', e => {
      token.tooltip.show();
      // this.tooltip.move(this.token.x() + TOKEN_WIDTH + MARGIN, this.token.y());
    });
    token.circle.on('mouseout', e => {
      // token.tooltip.hide();
    });

    token.clear = function() {
      /* console.log('****************** removing token ********************'); */
      /* console.log(this); */
      if (this.circle) this.circle.remove();
      if (this.tooltip) this.tooltip.remove();
      if (this.elements) this.elements.remove();
    };

    return token;
  };
  /******************************************************************************/
  /*                                 BUTTONS                                    */
  /******************************************************************************/

  // Create and position the controls and set their click handlers

  const btnOpen = new Button('open', this.canvas, 0, 0, BUTTON_WIDTH, () => {
    //input.click();
    btnOpenClick();
  });
  btnOpen.activate();
  controls.add(btnOpen.elements);

  const btnOpenClick = () => {
    // Reset animation and progress bar and disable controls until new file successfully read
    this.reset();
    this.disablePlayControls();
    // Launch the reading of stories and transitions from the file that
    // the user selected
    showModal();
    // If the file was successfully read, we should activate the control buttons
    this.enablePlayControls();
  };

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
    /* console.log('Enabling Play Controls'); */
    btnPlay.activate();
    btnStop.activate();
    sliderLine.on('click', sliderLineClick);
    sliderButton.on('dragmove.namespace', sliderButtonDragActive);
  };

  this.disablePlayControls = () => {
    /* console.log('Disabling Play Controls'); */
    btnPlay.passivate();
    btnStop.passivate();
    sliderLine.off();
    sliderButton.on('dragmove.namespace', sliderButtonDragInactive);
  };

  /******************************************************************************
                       SLIDER aka PROGRESS BAR
   ******************************************************************************/

  const sliderBackground = this.canvas.line(
    SLIDER_MARGIN,
    SLIDER_CY,
    SLIDER_MARGIN + SLIDER_FULL_LENGTH,
    SLIDER_CY
  );
  sliderBackground.stroke({
    width: SLIDER_LINE_WIDTH,
    linecap: 'round',
    color: '#fff',
  });
  sliderBackground.addClass('slider-background');

  const sliderLine = this.canvas
    .line(SLIDER_MARGIN, SLIDER_CY, SLIDER_MARGIN + 1, SLIDER_CY)
    .stroke({
      color: SLIDER_COLOR,
      width: SLIDER_LINE_WIDTH,
      opacity: 1,
      linecap: 'round',
    });

  this.theSliderLine = sliderLine;

  const sliderLineClick = e => {
    const { x } = sliderLine.point(e.pageX, e.pageY);
    const progress = x - SLIDER_MARGIN;

    timeline.time(Math.round(progress * this.factor));

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

    // if (x > SLIDER_MARGIN + SLIDER_FULL_LENGTH - SLIDER_BUTTON_RADIUS / 2) {
    //   x = SLIDER_MARGIN + SLIDER_FULL_LENGTH - SLIDER_BUTTON_RADIUS / 2;
    // }

    if (x > SLIDER_MARGIN + sliderLine.width() - SLIDER_BUTTON_RADIUS / 2) {
      x = SLIDER_MARGIN + sliderLine.width() - SLIDER_BUTTON_RADIUS / 2;
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

  /******************************************************************************
                          CALENDAR TIMELINE
   ******************************************************************************/

  Date.prototype.getDays = function() {
    return this.getTime() / (1000 * 60 * 60 * 24);
  };

  Date.prototype.addDays = function(days) {
    // https://stackoverflow.com/questions/563406/add-days-to-javascript-date
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  this.drawCalendarTimeline = (startDate, endDate) => {
    const maxDayTicks = SLIDER_FULL_LENGTH / 25;
    const maxMonthTicks = SLIDER_FULL_LENGTH / 30;
    const maxYearTicks = SLIDER_FULL_LENGTH / 30;
    const dt_margin = 5;
    const dayLineHeight = 1;
    const dayLabelHeight = 10;
    const dayMarkerHeight = dayLineHeight + dt_margin + dayLabelHeight;
    const monthLabelHeight = 12;
    const yearLabelHeight = 12;

    const daysInProject = endDate.getDays() - startDate.getDays();

    var dayInterval = undefined;

    if (daysInProject <= maxDayTicks) {
      dayInterval = 1;
    } else if (daysInProject / 2 <= maxDayTicks) {
      dayInterval = 2;
    } else if (daysInProject / 5 <= maxDayTicks) {
      dayInterval = 5;
    }

    const plotDays = dayInterval != undefined;

    const monthsInProject =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth();

    var monthInterval = undefined;
    if (monthsInProject == 0) {
      monthInterval = undefined;
    } else if (monthsInProject <= maxMonthTicks) {
      monthInterval = 1;
    } else if (monthsInProject / 2 <= maxMonthTicks) {
      monthInterval = 2;
    } else if (monthsInProject / 3 <= maxMonthTicks) {
      monthInterval = 3;
    } else if (monthsInProject / 6 <= maxMonthTicks) {
      monthInterval = 6;
    }
    const plotMonths = monthInterval != undefined;

    const yearsInProject = endDate.getFullYear() - startDate.getFullYear();

    var yearInterval = undefined;
    if (yearsInProject == 0) {
      yearInterval = undefined;
    } else if (yearsInProject <= maxYearTicks) {
      yearInterval = 1;
    } else if (yearsInProject / 2 <= maxYearTicks) {
      yearInterval = 2;
    } else if (yearsInProject / 5 <= maxYearTicks) {
      yearInterval = 5;
    } else if (yearsInProject / 10 <= maxYearTicks) {
      yearInterval = 10;
    } // not going to support longer projects than this !!! :-D

    for (var day = 0; day <= daysInProject; day++) {
      const date = new Date(startDate.valueOf()).addDays(day);

      const xCoord = Math.round(
        CALENDAR_TIMELINE_LEFT + (day / daysInProject) * CALENDAR_TIMELINE_WIDTH
      );

      // Plot day markers
      const dayInMonth = date.getDate();

      if (plotDays & (dayInMonth % dayInterval == 0) && dayInMonth > 1) {
        const dayLabelY = CALENDAR_TIMELINE_TOP;
        this.canvas
          .line(
            xCoord,
            CALENDAR_TIMELINE_TOP,
            xCoord,
            CALENDAR_TIMELINE_TOP + dayLineHeight
          )
          .back()
          .stroke({ color: '#fff', opacity: 1, width: 3, linecap: 'round' });

        this.canvas
          .text(
            new Intl.DateTimeFormat('en-US', {
              day: '2-digit',
            }).format(startDate.addDays(day))
          )
          .move(xCoord, CALENDAR_TIMELINE_TOP + dayLineHeight + dt_margin)
          .font({
            anchor: 'middle',
            size: '10px',
          });
      }

      // Plot month markers
      const month = date.getMonth();
      if (plotMonths & (dayInMonth == 1) && month % monthInterval == 0) {
        var monthLineY1 = 0;
        var monthLineY2 = 0;
        var monthLabelY = 0;

        if (plotDays) {
          monthLineY1 = CALENDAR_TIMELINE_TOP;
          monthLineY2 = CALENDAR_TIMELINE_TOP + dayMarkerHeight;
          monthLabelY = monthLineY2 + dt_margin;
        } else {
          monthLineY1 = CALENDAR_TIMELINE_TOP;
          monthLineY2 = CALENDAR_TIMELINE_TOP + dt_margin;
          monthLabelY = monthLineY2 + dt_margin;
        }

        this.canvas
          .line(xCoord, monthLineY1, xCoord, monthLineY2)
          .back()
          .stroke({ color: '#fff', opacity: 1, width: 3, linecap: 'round' });

        this.canvas
          .text(
            new Intl.DateTimeFormat('en-US', {
              month: 'short',
            }).format(date)
          )
          .cx(xCoord)
          .y(monthLabelY)
          .font({
            anchor: 'center',
            size: '12px',
            weight: 'bold',
          });
      }

      // Plot year markers
      const yearInProject = date.getFullYear() - startDate.getFullYear();

      if (
        (month == 0) &
        (dayInMonth == 1) &
        (yearInProject % yearInterval == 0)
      ) {
        var yearLineY1 = 0;
        var yearLineY2 = 0;
        var yearLabelY = 0;

        if (plotMonths) {
          yearLineY1 = monthLineY2;
          yearLineY2 = monthLineY2;
          yearLabelY = monthLabelY + monthLabelHeight + dt_margin;
        } else {
          yearLineY1 = CALENDAR_TIMELINE_TOP;
          yearLineY2 = CALENDAR_TIMELINE_TOP + dt_margin;
          yearLabelY = CALENDAR_TIMELINE_TOP + 2 * dt_margin;
        }

        this.canvas
          .line(xCoord, yearLineY1, xCoord, yearLineY2)
          .back()
          .stroke({ color: '#fff', opacity: 1, width: 3, linecap: 'round' });

        this.canvas
          .text(
            new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
            }).format(date)
          )
          .cx(xCoord)
          .y(yearLabelY)
          .font({
            anchor: 'center',
            size: '12px',
            weight: 'bold',
          });
      }
    }
  };

  /****************************************************************************
                              MODAL
   ****************************************************************************/

  const modal = document.getElementById('myModal');
  const modalContent = document.getElementById('modalContent');
  var modalCurrentPage;

  function showModal() {
    modal.style.visibility = 'visible';
    modal.style.opacity = 1;
    // modalContent.style.display = 'block';
    showModalPage(0);
  }

  function hideModal() {
    modal.style.visibility = 'hidden';
    modal.style.opacity = 0;
    setTimeout(() => {
      // modalContent.style.display = 'none';
    }, 1000);
  }

  function showModalPage(pageToShow) {
    // Show the chosen page and hide the others
    var modalPages = document.getElementsByClassName('modal-page');
    for (var pageNr = 0; pageNr < modalPages.length; pageNr++) {
      if (pageNr == pageToShow) {
        modalPages[pageNr].style.display = 'block';
      } else {
        modalPages[pageNr].style.display = 'none';
      }
    }
    modalCurrentPage = pageToShow;
  }

  document.getElementById('btnClose').onclick = function() {
    hideModal();
  };

  // When the user clicks anywhere outside of the modal content, close the modal
  window.onclick = function(event) {
    if (event.target == modal) {
      hideModal();
    }
  };

  document.getElementById('btnNext').addEventListener('click', event => {
    event.preventDefault();
    switch (modalCurrentPage) {
      case 0:
        this.url = document.getElementById('inpUrl').value.replace(/\/$/, ''); // remove any trailing slash in the URL
        this.id = document.getElementById('inpUserId').value;
        this.token = document.getElementById('inpToken').value;
        const boardsPromise = getBoardsFromJira(this.url, this.id, this.token);
        boardsPromise.then(boardsJSON => {
          const boards = {
            names: [],
            ids: [],
            push: (name, id) => {
              boards.names.push(name);
              boards.ids.push(id);
            },
            length: () => boards.names.length,
            getBoardId: boardName =>
              boards.ids[boards.names.indexOf(boardName)],
          };
          boardsJSON.values.forEach(value => boards.push(value.name, value.id));

          const boardAutoComplete = new autoComplete({
            selector: '#inpBoard',
            minChars: 0,
            source: function(term, suggest) {
              term = term.toLowerCase();
              var suggestions = [];
              for (var i = 0; i < boards.length(); i++)
                if (boards.names[i].toLowerCase().includes(term))
                  suggestions.push(boards.names[i]);
              suggest(suggestions);
            },
            onSelect: function(e, term, item) {
              /* console.log('Autocomplete onSelect'); */
              /* console.log(e); */
              /* console.log(term); */
              /* console.log(item); */
              /* console.log(''); */
              document.getElementById('btnNext').disabled = false;
              document.getElementById('btnNext').focus();
            },
          });
          document.getElementById('inpBoard').oninput = function(event) {
            if (boards.names.indexOf(this.value) >= 0) {
              document.getElementById('btnNext').disabled = false;
              document.getElementById('btnNext').focus();
            } else {
              document.getElementById('btnNext').disabled = true;
            }
          };
          this.boards = boards;
          showModalPage(1);
        });
        break;
      case 1:
        const boardName = document.getElementById('inpBoard').value;
        const boardId = this.boards.getBoardId(boardName);
        const columns = this.readProjectDataFromJira(
          this.url,
          this.id,
          this.token,
          boardId
        );

        hideModal();
    }
  });

  document.getElementById('btnBack').addEventListener('click', event => {
    switch (modalCurrentPage) {
      case 1:
        showModalPage(0);
        break;
    }
  });
}