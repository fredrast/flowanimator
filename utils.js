const DATE_FORMAT = 'dd.mm.yyyy'; // TODO move this into a proper settings object

export function stringToDate(date) {
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
  const formatedDate = new Date(
    dateItems[yearIndex],
    dateItems[monthIndex] - 1,
    dateItems[dayIndex]
  );

  // const formatedDate = new Date(Date.parse(date));

  return formatedDate;
}
