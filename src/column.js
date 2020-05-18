/**
 * @file src/column.js
 * @description Defines the {@link Column} class for representing the columns of the
 * Jira board being animated, and the {@link ColumnCollection} class for creating
 * the columns and holding the list of columns of the current board and performing
 * certain operations on them.
 */

import React, { memo } from 'react';

export const UNCREATED_COLUMN_ID = 0;
const FIRST_COLUMN_ID = 1;
const COMMITTED_COLUMN = 2;
const DONE_COLUMN_FROM_END = 1;
const PADDING_BOTTOM = 5;

/**
 * @constructor Column
 * @description Constructor for objects to represent the columns of the Jira
 * board being animated. Column objects are created by the column collection
 * object (`Columns.addColumnsFromJira`) based on the column information in the
 * board configuration data read from Jira.
 * @param number Running number of the columns. 0 is reserved for the virtual and
 * invisible "uncreated" column (where stories are initially placed when they are
 * constructed and from where they fly into the first "real" column) and numbers 1
 * onwards are for the "real" columns.
 * @param name Name of the column, which will be displayed on the ui.
 * @param statuses A list of Jira workflow statuses, which are mapped to
 * this column
 */
export function Column(number, name, statuses, visible) {
  this.number = number;
  this.name = name;
  this.storiesInColumn = [];
  this.text = {};
  this.center = 0;
  this.statusesInColumn = [];
  if (statuses) {
    statuses.forEach(status => this.statusesInColumn.push(status.id));
  }
  this.visible = visible;
  /**
   * @memberof Column
   * @instance
   * @method clear
   * @description Removes the textural representation of the column from the ui
   * and clears its list of associated stories and statuses. Used when clearing
   * the data of a loaded project, including its columns, before loading a
   * new project with new columns.
   */
  this.clear = function() {
    // Remove the textual representation of this column (if any) from the ui
    if (this.text.remove) this.text.remove();
    // Not sure whether this is really necessary, but it should not hurt
    this.storiesInColumn.length = 0;
    // As above
    this.statusesInColumn.length = 0;
  };
}

/**
 * @constructor ColumnCollection
 * @description Constructor for an object that creates the columns of the
 * current board and holds a list of these columns and performs certain
 * operations on them.
 */
export function ColumnCollection() {
  this.columns = [];
  /**
   * @memberof ColumnCollection
   * @instance
   * @method addColumnsFromFile
   * @description Creates columns from input originating from a CSV file
   * selected by the user. NOT IN USE FOR THE MOMENT.
   * @param columnFields An array of field names, which was constructed
   * in the calling function from the first line of the CSV file.
   */
  this.addColumnsFromFile = function(columnFields) {
    // Start by creating a virtual and invisible "uncreated" column for
    // initially holding newly created stories before they make their
    // transition into the first real column.
    const uncreatedColumn = new Column(0, 'Uncreated', null, false);
    this.columns.push(uncreatedColumn);
    // Loop through the array of column names and create column objects
    // for each encountered column name
    for (var fieldNo = 0; fieldNo < columnFields.length; fieldNo++) {
      // disregard any empty fields, which might be found at the right end of the line
      if (columnFields[fieldNo] !== '') {
        const columnNr = fieldNo + 1; // column number 0 used for uncreated column, hence +1
        const column = new Column(columnNr, columnFields[fieldNo], null, true);
        this.columns.push(column);
      }
    }
  };
  /**
   * @memberof ColumnCollection
   * @instance
   * @method addColumnsFromJira
   * @description Creates columns based on input originating from
   * board configuration data read from the Jira REST API in the calling
   * functions.
   * @param columnsFromJira An array of column data, which was constructed
   * in the calling function based on board configuration data read from the
   * Jira REST API.
   */
  this.addColumnsFromJira = columnsFromJira => {
    // Start by creating a virtual and invisible "uncreated" column for
    // initially holding newly created stories before they make their
    // transition into the first real column.
    const uncreatedColumn = new Column(0, 'Uncreated', null, false);
    this.columns.push(uncreatedColumn);
    // Loop through the array of column data and create column objects
    // for each encountered column record.
    for (var fieldNo = 0; fieldNo < columnsFromJira.length; fieldNo++) {
      // Include only columns with at least one status mapped to them
      if (columnsFromJira[fieldNo].statuses.length > 0) {
        // Create a new Column object...
        const columnNr = fieldNo + 1; // column number 0 used for uncreates column, hence +1
        const name = columnsFromJira[fieldNo].name;
        const statuses = columnsFromJira[fieldNo].statuses;
        const column = new Column(columnNr, name, statuses, true);
        // ...and push it onto our list of columns
        this.columns.push(column);
      }
    }
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getCount
   * @description Returns the number of columns in the column collection.
   */
  this.getCount = () => {
    return this.columns.length;
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getColumn
   * @description Returns the column with the given index. Called from
   * StoryCollection.addStoriesFromFile, which is not in use for the moment.
   * @param columnNr {integer} The index of the column to be retrieved.
   */
  this.getColumn = columnNr => {
    return this.columns[columnNr];
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getColumns
   * @description Returns an array with all columns in the column collection.
   */
  this.getColumns = () => {
    return [...this.columns]; // return a copy of the columns array
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getUncreatedColumn
   * @description Returns the virtual "uncreated" column used for holding
   * stories before they transition into the first real column.
   */
  this.getUncreatedColumn = () => {
    return this.columns[UNCREATED_COLUMN_ID];
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getFirstColumn
   * @description Returns the first "real" column in the column collection.
   * Called from **`Animation.addStoriesFromJira`**.
   */
  this.getFirstColumn = () => {
    return this.columns[FIRST_COLUMN_ID];
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getCommittedColumn
   * @description Returns the column from of which stories are considered
   * to be "committed", i.e. meant to be actively worked on. This is typically
   * the second column and for now we assume that this is always the case.
   * Used in Animation.generateColorAnimation() where the
   * coloring of a story according to age starts from the point when the
   * story enters the committed column.
   */
  this.getCommittedColumn = () => this.columns[COMMITTED_COLUMN];

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getDoneColumn
   * @description Returns the column from of which stories are considered
   * to be "done", i.e. fully ready. This is typically the last column and for
   * now we assume that this is always the case. Used in
   * Animation.generateColorAnimation() where the coloring of a story according
   * to age ends at the point when the story reaches the done column.
   */
  this.getDoneColumn = () =>
    this.columns[this.columns.length - DONE_COLUMN_FROM_END];

  /**
   * @memberof ColumnCollection
   * @instance
   * @method getColumnOfStatus
   * @description Returns the column to whih a certain status in the Jira
   * workflow has been mapped.
   */
  this.getColumnOfStatus = statusNr => {
    for (var i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      // A status should never be mapped to more than one column, so we can
      // return the first column where the status is found and exit.
      if (column.statusesInColumn.indexOf(statusNr) >= 0) {
        return column;
      }
    }
    // Getting this far meant that no column containing the given status was found
    return null;
  };

  /**
   * @memberof ColumnCollection
   * @instance
   * @method clear
   * @description Removes all columns from the column collection. Used when
   * clearing the data of a loaded project, including its columns, before
   * loading a new project with new columns. The column collection itself
   * does not get removed, only emptied of its columns.
   */
  this.clear = () => {
    this.columns.forEach(column => {
      column.clear();
      column = null;
    });
    // Not sure whether this is really necessary, but it should not hurt
    this.columns.length = 0;
  };
}

function ColumnLabels(props) {
  console.log('Render ColumnLabels');

  const labelWrapperStyle = {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: props.margin,
    paddingBottom: PADDING_BOTTOM,
    paddingLeft: props.margin,
  };

  const labelContainerStyle = {
    flex: 1,
    margin: '2px 8px 6px 8px',
  };

  const labelLineStyle = {
    height: '3px',
    marginBottom: '3px',
    borderRadius: '2px',
    backgroundColor: '#fff',
    opacity: '60%',
  };

  const labelStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '2px',
  };
  //  whiteSpace: 'nowrap',

  return (
    <div id="column-labels" style={labelWrapperStyle}>
      {props.columns.getColumns().map(column => (
        <div
          key={column.name}
          style={{ ...labelContainerStyle, ...labelStyle }}
        >
          <div style={labelLineStyle} />
          {column.name}
        </div>
      ))}
    </div>
  );
}

export default memo(ColumnLabels);
