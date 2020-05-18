const DATE_FORMAT = 'dd.mm.yyyy'; // TODO move this into a proper settings object
const DATE_TIME_FORMAT = 'dd.mm.yyyy'; // TODO move this into a proper settings object

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

  msToTime: duration => {
    // thanks to https://coderwall.com/p/wkdefg/converting-milliseconds-to-hh-mm-ss-mmm
    var milliseconds = parseInt(duration % 1000),
      seconds = parseInt(duration / 1000) % 60,
      minutes = parseInt(duration / (1000 * 60)) % 60,
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
  },
};

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
