export const UNCREATED_COLUMN_ID = 0;
const FIRST_COLUMN_ID = 1;
const COMMITTED_COLUMN = 2;
const DONE_COLUMN_FROM_END = 1;

// Constructor for objects to represent the columns in the current project
export function Column(number, name, statuses) {
  this.number = number;
  this.name = name;
  this.storiesInColumn = [];
  this.text = {};
  this.center = 0;
  this.statusesInColumn = [];
  if (statuses) {
    statuses.forEach(status => this.statusesInColumn.push(status.id));
  }
  this.clear = function() {
    if (this.text.remove) this.text.remove();
    this.storiesInColumn.length = [];
  };
}

export function ColumnCollection() {
  this.columns = [];

  this.addColumnsFromFile = columnFields => {
    // Loop through the fields of the first line of the input file holding the columns
    // and create column objects for each encountered column

    const uncreatedColumn = new Column(0, 'Uncreated');
    this.columns.push(uncreatedColumn);

    for (var fieldNo = 0; fieldNo < columnFields.length; fieldNo++) {
      if (columnFields[fieldNo] != '') {
        // disregard any empty fields, which might be found at the right end of the line
        const columnNr = fieldNo + 1; // column number 0 used for uncreates column, hence +1
        const column = new Column(columnNr, columnFields[fieldNo]);

        this.columns.push(column);
      }
    }

    this.committedColumn = this.columns[COMMITTED_COLUMN];
    this.doneColumn = this.columns[this.columns.length - DONE_COLUMN_FROM_END];
  };

  this.addColumnsFromJira = columnsFromJira => {
    const uncreatedColumn = new Column(0, 'Uncreated');
    this.columns.push(uncreatedColumn);

    for (var fieldNo = 0; fieldNo < columnsFromJira.length; fieldNo++) {
      if (columnsFromJira[fieldNo].statuses.length > 0) {
        // disregard columns with no statuses mapped to them
        const columnNr = fieldNo + 1; // column number 0 used for uncreates column, hence +1
        const name = columnsFromJira[fieldNo].name;
        const statuses = columnsFromJira[fieldNo].statuses;
        const column = new Column(columnNr, name, statuses);

        this.columns.push(column);
      }
    }

    this.committedColumn = this.columns[COMMITTED_COLUMN];
    this.doneColumn = this.columns[this.columns.length - DONE_COLUMN_FROM_END];
  };

  this.getCount = () => {
    return this.columns.length;
  };

  this.getColumn = columnNr => {
    return this.columns[columnNr];
  };

  this.getColumns = () => {
    return [...this.columns]; // return a copy of the columns array
  };

  this.getUncreatedColumn = () => {
    return this.columns[UNCREATED_COLUMN_ID];
  };

  this.getFirstColumn = () => {
    return this.columns[FIRST_COLUMN_ID];
  };

  this.getColumnOfStatus = statusNr => {
    for (var i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      if (column.statusesInColumn.indexOf(statusNr) >= 0) {
        return column; // a status should never be mapped to more than one column, so we can return the first column where the status is found
      }
    }
    return null; // no column containing this particular status found
  };

  this.clear = () => {
    this.columns.forEach(column => {
      column.clear();
      column = null;
    });
    this.columns.length = 0;
  };
}
