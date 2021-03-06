const DATE_FORMAT = 'dd.mm.yyyy'; // TODO move this into a proper settings object
const DATE_TIME_FORMAT = 'dd.mm.yyyy'; // TODO move this into a proper settings object

export function shareOfIntervalCovered(point, intervalStart, intervalEnd) {
  return (
    Math.max(Math.min(point, intervalEnd) - intervalStart, 0) /
    (intervalEnd - intervalStart)
  );
}

export function amountOfIntervalCovered(point, intervalStart, intervalEnd) {
  return Math.max(Math.min(point, intervalEnd) - intervalStart, 0);
}

export const utils = {
  /****************************************************************************
                                setIntervalAsync
 ****************************************************************************/

  setIntervalAsync: function executeIntervalAsync(
    fn,
    delay,
    progressCallback,
    completionCallback
  ) {
    fn().then(response => {
      if (!response.done) {
        progressCallback(response.value);
        setTimeout(
          () =>
            executeIntervalAsync(
              fn,
              delay,
              progressCallback,
              completionCallback
            ),
          delay
        );
      } else {
        completionCallback();
      }
    });
  },

  /****************************************************************************
                                stringToDate
 ****************************************************************************/

  stringToDate: date => {
    var format = DATE_FORMAT;
    // eliminating possible time component for now
    date = date.split(' ')[0];
    date = date.split('T')[0];
    format = format.split(' ')[0];
    format = format.split('T')[0];

    const delimiter = format.match(/\W/g)[0];
    const formatLowerCase = format.toLowerCase();
    const formatItems = formatLowerCase.split(delimiter);
    const dateItems = date.split(delimiter);
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndex = formatItems.indexOf('yyyy');
    const formattedDate = new Date(
      dateItems[yearIndex],
      dateItems[monthIndex] - 1,
      dateItems[dayIndex]
    );

    // const formattedDate = new Date(Date.parse(date));

    return formattedDate;
  },

  /****************************************************************************
                                stringToDateTime
 ****************************************************************************/

  stringToDateTime: dateTime => {
    var dateTimeformat = DATE_TIME_FORMAT;

    var timePartDelimiter = null;
    if (dateTimeformat.match(/T/)) {
      timePartDelimiter = 'T';
    } else {
      if (dateTimeformat.match(/\x20/)) {
        timePartDelimiter = ' ';
      }
    }

    var dateFormat;
    var timeFormat;
    var date;
    var time;
    var formattedDateTime;

    if (timePartDelimiter) {
      dateFormat = dateTimeformat.split(timePartDelimiter)[0];
      timeFormat = dateTimeformat.split(timePartDelimiter)[1];
      date = dateTime.split(timePartDelimiter)[0];
      time = dateTime.split(timePartDelimiter)[1];
    } else {
      dateFormat = dateTimeformat;
      date = dateTime;
    }

    const dateDelimiter = dateFormat.match(/\W/g)[0];
    const dateFormatLowerCase = dateFormat.toLowerCase();
    const dateFormatItems = dateFormatLowerCase.split(dateDelimiter);
    const dateItems = date.split(dateDelimiter);
    const monthIndex = dateFormatItems.indexOf('mm');
    const dayIndex = dateFormatItems.indexOf('dd');
    const yearIndex = dateFormatItems.indexOf('yyyy');

    if (timePartDelimiter) {
      const timeDelimiter = timeFormat.match(/\W/g)[0];
      const timeFormatLowerCase = timeFormat.toLowerCase();
      const timeFormatItems = timeFormatLowerCase.split(timeDelimiter);
      const timeItems = time.split(timeDelimiter);
      const hourIndex = timeFormatItems.indexOf('hh');
      const minuteIndex = timeFormatItems.indexOf('mm');
      const secondIndex = timeFormatItems.indexOf('ss');
      formattedDateTime = new Date(
        dateItems[yearIndex],
        dateItems[monthIndex] - 1,
        dateItems[dayIndex],
        timeItems[hourIndex],
        timeItems[minuteIndex],
        timeItems[secondIndex]
      );
    } else {
      formattedDateTime = new Date(
        dateItems[yearIndex],
        dateItems[monthIndex] - 1,
        dateItems[dayIndex]
      );
    }

    return formattedDateTime;
  },

  /****************************************************************************
                               msToTime
 ****************************************************************************/

  msToTime: durationInMs => {
    // thanks to https://coderwall.com/p/wkdefg/converting-milliseconds-to-hh-mm-ss-mmm
    const milliseconds = parseInt(durationInMs) % 1000;
    var seconds = (parseInt(durationInMs) / 1000) % 60;
    var minutes = (parseInt(durationInMs) / (1000 * 60)) % 60;
    var hours = (parseInt(durationInMs) / (1000 * 60 * 60)) % 24;
    const days = parseInt(durationInMs) / (1000 * 60 * 60 * 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    var timeStr = hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
    if (days > 0) {
      timeStr = days + 'd' + timeStr;
    }

    return timeStr;
  },

  /****************************************************************************
                               msToDays
 ****************************************************************************/

  msToDays: durationInMs => {
    // thanks to https://coderwall.com/p/wkdefg/converting-milliseconds-to-hh-mm-ss-mmm
    // const hours = Math.trunc((durationInMs / (1000 * 60 * 60)) % 24);
    const days = Math.round(durationInMs / (1000 * 60 * 60 * 24));

    return days + ' d ';
  },
};

export function measureStringWidth(string, font) {
  // https://stackoverflow.com/questions/5353385/how-to-calculate-the-length-in-pixels-of-a-string-in-javascript
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font; // "11px Arial"
  const width = ctx.measureText(string).width;
  canvas.remove();
  return width;
}

/*
function saveJSON(data) {
  let bl = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(bl);
  a.download = 'data.json';
  a.hidden = true;
  document.body.appendChild(a);
  a.innerHTML = 'someinnerhtml';
  a.click();
}
*/
