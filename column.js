export const UNCREATED_COLUMN_ID = 0;
const COMMITTED_COLUMN = 1;
const DONE_COLUMN_FROM_END = 2;

// Constructor for objects to represent the columns in the current project
export function Column(number, name) {
  this.number = number;
  this.name = name;
  this.storiesInColumn = [];
  this.text = {};
  this.center = 0;

  this.clear = function() {
    if (this.text.remove) this.text.remove();
    this.storiesInColumn.length = [];
  };
}

export function ColumnCollection() {
  const columns = [];

  this.addColumnsFromFile = columnFields => {
    // Loop through the fields of the first line of the input file holding the columns
    // and create column objects for each encountered column

    const uncreatedColumn = new Column(0, 'Uncreated');
    columns.push(uncreatedColumn);

    for (var fieldNo = 0; fieldNo < columnFields.length; fieldNo++) {
      if (columnFields[fieldNo] != '') {
        // disregard any empty fields, which might be found at the right end of the line
        const columnNr = fieldNo + 1; // column number 0 used for uncreates column, hence +1
        const column = new Column(columnNr, columnFields[fieldNo]);

        columns.push(column);
      }
    }

    this.committedColumn = columns[COMMITTED_COLUMN];
    this.doneColumn = columns[columns.length - DONE_COLUMN_FROM_END];
  };

  this.addColumnsFromJira = columnsFromJira => {
    // Loop through the fields of the first line of the input file holding the columns
    // and create column objects for each encountered column

    const uncreatedColumn = new Column(0, 'Uncreated');
    columns.push(uncreatedColumn);

    for (var fieldNo = 0; fieldNo < columnsFromJira.length; fieldNo++) {
      if (columnsFromJira[fieldNo] != '') {
        // disregard any empty fields, which might be found at the right end of the line
        const columnNr = fieldNo + 1; // column number 0 used for uncreates column, hence +1
        const column = new Column(columnNr, columnsFromJira[fieldNo].name);

        columns.push(column);
      }
    }

    this.committedColumn = columns[COMMITTED_COLUMN];
    this.doneColumn = columns[columns.length - DONE_COLUMN_FROM_END];
  };

  this.getCount = () => {
    return columns.length;
  };

  this.getColumn = columnNr => {
    return columns[columnNr];
  };

  this.getColumns = () => {
    return [...columns]; // return a copy of the columns array
  };

  this.getUncreatedColumn = () => {
    return columns[UNCREATED_COLUMN_ID];
  };

  this.clear = () => {
    columns.forEach(column => {
      column.clear();
      column = null;
    });
    columns.length = 0;
  };
}
