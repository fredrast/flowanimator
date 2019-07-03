export function stringToDate(date, format) {
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
  const formatedDate = new Date(
    dateItems[yearIndex],
    dateItems[monthIndex] - 1,
    dateItems[dayIndex]
  );
  // const formatedDate = new Date(Date.parse(date));

  return formatedDate;
}

export function setIntervalAsync(fn, ms) {
  fn().then(() => {
    setTimeout(() => setIntervalAsync(fn, ms), ms);
  });
}
