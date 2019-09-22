export const UNCREATED_STATUS_ID = 0;
const COMMITTED_STATUS = 1;
const DONE_STATUS_FROM_END = 2;

// Constructor for objects to represent the statuses in the current project
export function Status(number, name) {
  this.number = number;
  this.name = name;
  this.storiesInStatus = [];
  this.text = {};
  this.center = 0;

  this.clear = function() {
    if (this.text.remove) this.text.remove();
    this.storiesInStatus.length = [];
  };
}

export function StatusCollection() {
  const statuses = [];

  this.addStatusesFromFile = statusFields => {
    // Loop through the fields of the first line of the input file holding the statuses
    // and create status objects for each encountered status

    const uncreatedStatus = new Status(0, 'Uncreated');
    statuses.push(uncreatedStatus);

    for (var fieldNo = 0; fieldNo < statusFields.length; fieldNo++) {
      if (statusFields[fieldNo] != '') {
        // disregard any empty fields, which might be found at the right end of the line
        const statusNr = fieldNo + 1; // status number 0 used for uncreates status, hence +1
        const status = new Status(statusNr, statusFields[fieldNo]);

        statuses.push(status);
      }
    }

    this.committedStatus = statuses[COMMITTED_STATUS];
    this.doneStatus = statuses[statuses.length - DONE_STATUS_FROM_END];
  };

  this.addStatusesFromJira = statusesFromJira => {
    // Loop through the fields of the first line of the input file holding the statuses
    // and create status objects for each encountered status

    const uncreatedStatus = new Status(0, 'Uncreated');
    statuses.push(uncreatedStatus);

    for (var fieldNo = 0; fieldNo < statusesFromJira.length; fieldNo++) {
      if (statusesFromJira[fieldNo] != '') {
        // disregard any empty fields, which might be found at the right end of the line
        const statusNr = fieldNo + 1; // status number 0 used for uncreates status, hence +1
        const status = new Status(statusNr, statusesFromJira[fieldNo].name);

        statuses.push(status);
      }
    }

    this.committedStatus = statuses[COMMITTED_STATUS];
    this.doneStatus = statuses[statuses.length - DONE_STATUS_FROM_END];
  };

  this.getCount = () => {
    return statuses.length;
  };

  this.getStatus = statusNr => {
    return statuses[statusNr];
  };

  this.getStatuses = () => {
    return [...statuses]; // return a copy of the statuses array
  };

  this.getUncreatedStatus = () => {
    return statuses[UNCREATED_STATUS_ID];
  };

  this.clear = () => {
    statuses.forEach(status => {
      status.clear();
      status = null;
    });
    statuses.length = 0;
  };
}
