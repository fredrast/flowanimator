import React from 'react';

/******************************************************************************
                        CALENDAR TIMELINE
 ******************************************************************************/

export function CalendarTimeline(props) {
  console.log('CalendarTimeline:');
  console.log(props);
  if (props.timespan) {
    console.log(props.timespan);
    const startDate = new Date(props.timespan.startDate);
    const endDate = new Date(props.timespan.endDate);

    console.log(startDate);
    console.log(endDate);
    console.log(props.margin);
    console.log(props.width);

    const CALENDAR_TIMELINE_TOP = 0;
    const maxDayTicks = props.width / 25;
    const maxMonthTicks = props.width / 30;
    const maxYearTicks = props.width / 30;
    const dt_margin = 5;
    const dayLineHeight = 3;
    const dayLabelHeight = 10;
    const dayMarkerHeight = dayLineHeight + dt_margin + dayLabelHeight;
    const monthLabelHeight = 12;

    /*eslint no-extend-native: ["error", { "exceptions": ["Date"] }]*/
    Date.prototype.getDays = function() {
      return this.getTime() / (1000 * 60 * 60 * 24);
    };

    Date.prototype.addDays = function(days) {
      // https://stackoverflow.com/questions/563406/add-days-to-javascript-date
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };

    const daysInProject = endDate.getDays() - startDate.getDays();
    const lines = [];
    const labels = [];

    var dayInterval = undefined;

    if (daysInProject <= maxDayTicks) {
      dayInterval = 1;
    } else if (daysInProject / 2 <= maxDayTicks) {
      dayInterval = 2;
    } else if (daysInProject / 5 <= maxDayTicks) {
      dayInterval = 5;
    }

    const plotDays = dayInterval !== undefined;

    const monthsInProject =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth();

    var monthInterval = undefined;
    if (monthsInProject === 0) {
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
    const plotMonths = monthInterval !== undefined;

    const yearsInProject = endDate.getFullYear() - startDate.getFullYear();

    var yearInterval = undefined;
    if (yearsInProject === 0) {
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

      const xCoord = Math.round((day / daysInProject) * props.width);

      // Generate day markers
      const dayInMonth = date.getDate();

      if (plotDays & (dayInMonth % dayInterval === 0) && dayInMonth > 1) {
        lines.push({
          x1: xCoord,
          y1: CALENDAR_TIMELINE_TOP,
          x2: xCoord,
          y2: CALENDAR_TIMELINE_TOP + dayLineHeight,
        });

        labels.push({
          text: new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
          }).format(startDate.addDays(day)),
          x: xCoord,
          y: CALENDAR_TIMELINE_TOP + dayLineHeight + dt_margin,
        });
      }

      // Generate month markers
      const month = date.getMonth();
      let monthLineY1 = 0;
      let monthLineY2 = 0;
      let monthLabelY = 0;

      if (plotMonths & (dayInMonth === 1) && month % monthInterval === 0) {
        monthLineY1 = CALENDAR_TIMELINE_TOP;
        monthLineY2 = plotDays
          ? CALENDAR_TIMELINE_TOP + dayMarkerHeight
          : (monthLineY2 = CALENDAR_TIMELINE_TOP + dt_margin);
        monthLabelY = monthLineY2 + dt_margin;

        lines.push({
          x1: xCoord,
          y1: monthLineY1,
          x2: xCoord,
          y2: monthLineY2,
        });

        labels.push({
          text: new Intl.DateTimeFormat('en-US', {
            month: 'short',
          }).format(date),
          x: xCoord,
          y: monthLabelY,
        });
      }

      // Plot year markers
      const yearInProject = date.getFullYear() - startDate.getFullYear();

      if (
        (month === 0) &
        (dayInMonth === 1) &
        (yearInProject % yearInterval === 0)
      ) {
        let yearLineY1;
        let yearLineY2;
        let yearLabelY;

        if (plotMonths) {
          yearLineY1 = monthLineY2;
          yearLineY2 = monthLineY2;
          yearLabelY = monthLabelY + monthLabelHeight + dt_margin;
        } else {
          yearLineY1 = CALENDAR_TIMELINE_TOP;
          yearLineY2 = CALENDAR_TIMELINE_TOP + dt_margin;
          yearLabelY = CALENDAR_TIMELINE_TOP + 2 * dt_margin;
        }

        lines.push({
          x1: xCoord,
          y1: yearLineY1,
          x2: xCoord,
          y2: yearLineY2,
        });

        labels.push({
          text: new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
          }).format(date),
          x: xCoord,
          y: yearLabelY,
        });
      }
    }

    const lineStyle = { stroke: '#FFF', strokeWidth: 2 };

    return (
      <div id="calendar-timeline">
        <svg height="210" width={props.width}>
          {labels.map(label => (
            <text
              x={label.x}
              y={label.y}
              dominant-baseline="hanging"
              text-anchor="middle"
            >
              {label.text}
            </text>
          ))}{' '}
          {lines.map(line => (
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              style={lineStyle}
            />
          ))}{' '}
        </svg>
      </div>
    );
  } else {
    return <svg />;
  }
}
