/**
 * @file src/story.js
 * @description Defines the [Story]{@link Story} class for representing the stories to
 * be animated, and the [StoryCollecction]{@link StoryCollection} class for creating the stories
 * and holding the list of stories and performing certain operations on them.
 */
import React, { useCallback, useState, memo } from 'react';
import { Transition } from './transition.js';
import { amountOfIntervalCovered, utils, measureStringWidth } from './utils.js';
import { Move, MovesCollection } from './move.js';
import { TransitionCollection } from './transition.js';
import StoryPopup from './story-popup.js';

const ICON_WIDTH = 20;

/****************************************************************************
                                 STORY
 ****************************************************************************/
/**
 * @constructor Story
 * @description Constructor for objects to represent the stories in the current
 * project.
 * @param id Id (Jira key) of the story to be created
 * @param name Name (Jira summary) of the story to be created
 * @param column Column into which the story should initially be placed
 */
function Story(id, name, fields, initialColumn, serverUrl, animUtils) {
  this.id = id;
  this.name = name;
  this.fields = fields;
  this.column = initialColumn;
  this.initialColumn = this.column;
  this.url = serverUrl + '/browse/' + id;
  // Add this story to the list of stories in the column where this story is
  // initially placed...
  this.column.storiesInColumn.push(this);
  // ...and take note of the vertical slot in which this story landed in that column
  this.verticalSlot = this.column.storiesInColumn.indexOf(this);
  this.initialVerticalSlot = this.verticalSlot;
  this.transitions = [];
  this.previousTransitionAnimationFinish = 0;
  this.createdDate = new Date(fields.created).getTime();
  this.committedDate = null;
  this.doneDate = null;
  this.moves = [];
  this.modelX = 0;
  this.modelY = 0;
  this.screenX = -100;
  this.screenY = 0;

  /**
   * @memberof Story
   * @instance
   * @method setTransitions
   * @description Set this story's transitions from an array of transitions read
   * from Jira
   * @param transitions An array with transitions to be set on the story
   */
  this.setTransitions = transitions => {
    this.transitions = transitions;
  };

  /**
   * @memberof Story
   * @instance
   * @method getCreatedDate
   * @description Returns the date when the story got created
   */

  this.getCreatedDate = () => {
    return new Intl.DateTimeFormat('fi-FI', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date(this.createdDate));
  };

  // TODO: is this setter functions (and other similar ones) adding any value?
  /**
   * @memberof Story
   * @instance
   * @method setCommittedDate
   * @description Set the date when the story got "committed", i.e. when the
   * story got moved into a column that indicates that the story has been
   * selected to be worked on. This date is used in {@link generateColorAnimation}
   * @param timestamp A date value (in Unix Epoch milliseconds) to be set as
   * the story's committed date
   */
  this.setCommittedDate = timestamp => {
    this.committedDate = timestamp;
  };

  /**
   * @memberof Story
   * @instance
   * @method getCommittedDate
   * @description Returns the date when the story got "committed", i.e. when the
   * story got moved into a column that indicates that the story has been
   * selected to be worked on. This date is used in {@link generateColorAnimation}
   */
  this.getCommittedDate = () => {
    return this.committedDate;
  };

  /**
   * @memberof Story
   * @instance
   * @method setDoneDate
   * @description Set the date when the story got "done", i.e. when the
   * story got moved into a column that indicates that the story is fully ready.
   * This date is used in {@link generateColorAnimation}
   * @param timestamp A date value (in Unix Epoch milliseconds) to be set as
   * the story's done date
   */
  this.setDoneDate = timestamp => {
    this.doneDate = timestamp;
  };

  /**
   * @memberof Story
   * @instance
   * @method getDoneDate
   * @description Return the date when the story got "done", i.e. when the
   * story got moved into a column that indicates that the story is fully ready.
   * This date is used in {@link generateColorAnimation}
   */
  this.getDoneDate = () => {
    return this.doneDate;
  };

  /**
   * @memberof Story
   * @instance
   * @method getCycleTime
   * @description Return the Cycle Time of the story, i.e. timespan from
   * Committed Date to Done Date
   */

  this.getCycleTime = () => {
    if (this.doneDate && this.committedDate) {
      return utils.msToDays(this.doneDate - this.committedDate);
    } else {
      return 'Still in process';
    }
  };

  /**
   * @memberof Story
   * @instance
   * @method getLeadTime
   * @description Return the Lead  Time of the story, i.e. timespan from
   * Created Date to Done Date
   */

  this.getLeadTime = () => {
    if (this.createdDate && this.doneDate) {
      return utils.msToDays(this.doneDate - this.createdDate);
    } else {
      return 'Still in process';
    }
  };

  /**
   * @memberof Story
   * @instance
   * @method getNextTransition
   * @description Return the next transition, if any, after the transition
   * given as a parameter. This is used in {@link AnimationGenerator}.
   */
  this.getNextTransition = baselineTransition => {
    // Return the first of this story's transitions that comes after the baseline transition in sort order
    // Assuming that this story's transitions have been pushed onto the transitions array
    // in the order of the timestamps
    for (var i = 0; i < this.transitions.length; i++) {
      const transition = this.transitions[i];
      if (transition.getSortOrder(transition, baselineTransition) > 0) {
        return transition;
      }
    }
    // else, if no subsequent transition was found after the baselineTransition
    return null;
  };

  this.getLastTransitonDate = () => {
    if (this.transitions.length > 0) {
      return this.transitions[this.transitions.length - 1];
    }
  };

  /**
   * @memberof Story
   * @instance
   * @method addMove
   * @description
   */
  this.addMove = (
    type,
    start,
    duration,
    fromColumn,
    toColumn,
    fromSlot,
    toSlot
  ) => {
    const move = new Move(
      this,
      type,
      start,
      duration,
      fromColumn,
      toColumn,
      fromSlot,
      toSlot
    );
    this.moves.push(move);
    return move;
  };

  /**
   * @memberof Story
   * @instance
   * @method getPositionAtAnimationTime
   * @description
   */
  /*
  this.getPositionAtAnimationTime = animationTime => {
    const UNCREATED_COLUMN = 0;
    const UNCREATED_SLOT = 0;

    // console.log('getPositionAtAnimationTime');
    // console.log(this.id);
    // console.log(animationTime);
    // console.log();

    if (!this.columnToXCoord || !this.slotToYCoord) {
      return { x: -100, y: -100 };
    }
    // Traverse the story's moves from end towards beginning
    // until we come across the first move that starts at or before
    // the given animation time

    for (let i = this.moves.length - 1; i >= 0; i--) {
      let move = this.moves[i];

      if (move.start <= animationTime) {
        const startX = this.columnToXCoord(move.fromColumn.number);
        const startY = this.slotToYCoord(move.fromSlot);
        const endX = this.columnToXCoord(move.toColumn.number);
        const endY = this.slotToYCoord(move.toSlot);
        const progressFactor = Math.min(
          (animationTime - move.start) / move.duration,
          1
        );
        const x = startX + progressFactor * (endX - startX);
        const y = startY + progressFactor * (endY - startY);
        // console.log('x: ' + x + ', y: ' + y);
        return { x: x, y: y };
      }
    }
    // Story had no moves starting before given animation time, or no moves at all
    const x = this.columnToXCoord(UNCREATED_COLUMN);
    const y = this.slotToYCoord(UNCREATED_SLOT);
    return { x: x, y: y };
  };
*/

  /**
   * @memberof Story
   * @instance
   * @method getAppearanceAtAnimationTime
   * @description
   */

  this.getAppearanceAtAnimationTime = animationTime => {
    // TODO: is there a better way to pass calendarDateToAnimationTime and AGE_COLORING_MAX_AGE than by passing it down in animUtils to StoryCollection and Story?

    let colorAnimationProgress = 0;

    if (this.committedDate) {
      const colorAnimationStart = animUtils.calendarDateToAnimationTime(
        this.committedDate
      );

      const colorAnimationEnd = animUtils.calendarDateToAnimationTime(
        Math.min(
          this.doneDate || animUtils.lastTransitionDate,
          this.committedDate + animUtils.AGE_COLORING_MAX_AGE
        )
      );

      colorAnimationProgress =
        amountOfIntervalCovered(
          animationTime,
          colorAnimationStart,
          colorAnimationEnd
        ) /
        animUtils.calendarDaysToAnimationTime(animUtils.AGE_COLORING_MAX_AGE);
    }

    function decToHex(dec) {
      var hex = Math.round(dec).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }
    const gb = (1 - colorAnimationProgress) * 255;
    const fillcolor = '#ff' + decToHex(gb) + decToHex(gb);
    const fontColor = '#000';

    return { fillColor: fillcolor, fontColor: fontColor, opacity: 1 };
  };

  /**
   * @memberof Story
   * @instance
   * @method clear
   * @description Clear this story's data. Used when clearing the data of a
   * loaded project, including its stories, before loading a new project with
   * new stories.
   */
  this.clear = () => {
    this.transitions.length = 0;
    this.moves.length = 0;
  };

  this.getStatusStays = () => {
    console.log('getStatusStays');
    const statusStays = [];
    for (let i = 0; i < this.transitions.length - 1; i++) {
      const transition = this.transitions[i];
      const nextTransition = this.transitions[i + 1];
      const daysInStatus = utils.msToDays(
        nextTransition.timestamp - transition.timestamp
      );
      console.log(transition);
      statusStays.push({
        id: i,
        status: transition.toColumn.name,
        days: daysInStatus,
        date: transition.date,
      });
    }
    console.log(statusStays);
    return statusStays;
  };
}

/****************************************************************************
                             STORY COLLECTION
 ****************************************************************************/
/**
 * @constructor StoryCollection
 * @description Class for creating stories and for holding the list of stories
 * in the currently loaded project and for performing certain operations on them
 */
export function StoryCollection(animUtils) {
  this.stories = [];
  this.moves = new MovesCollection();
  this.transitions = new TransitionCollection(); // needs to be var since we'll be using .concat
  this.previousAnimationTime = 0;
  this.maxTokenStringWidth = 0;

  this.activeMoves = [];

  /**************************************************************************
                            addStoriesFromFile
   **************************************************************************/
  /**
   * @memberof StoryCollection
   * @instance
   * @method addStoriesFromFile
   * @description Creates stories from input originating from a CSV file
   * selected by the user. NOT IN USE FOR THE MOMENT.
   */
  this.addStoriesFromFile = (
    storyLines,
    delimiter,
    attribute_fields_in_import_file,
    columns
  ) => {
    //  Read and create stories and column transitions from subsequent lines in file
    storyLines.forEach(storyLine => {
      if (storyLine !== '' && storyLine.substr(1, 1) !== delimiter) {
        // disregard any possible empty lines, or lines consisting only of delimiters, which may be found at the end of the file

        const storyFields = storyLine.split(delimiter);
        const id = storyFields[0];
        const name = storyFields[2];
        const column = columns.getUncreatedColumn();
        const story = new Story(id, name, column, animUtils);
        this.stories.push(story);

        // Create the story's transitions
        const transitionFields = storyFields.slice(
          attribute_fields_in_import_file
        );
        const thisStorysTransitions = [];
        var fromColumn = columns.getUncreatedColumn();
        var previousTransitionFinishDateTime = 0;

        for (var fieldNo = 0; fieldNo < transitionFields.length; fieldNo++) {
          if (transitionFields[fieldNo] !== '') {
            // disregard empty fields

            const toColumn = columns.getColumn(fieldNo + 1); // column numbering starts from 1 since columns[0] is the uncreated column
            const timestamp = utils
              .stringToDateTime(transitionFields[fieldNo])
              .getTime();

            const transitionStartDateTime = Math.max(
              timestamp,
              previousTransitionFinishDateTime
            );

            const transition = new Transition(
              story,
              fromColumn,
              toColumn,
              timestamp,
              transitionStartDateTime
            );

            thisStorysTransitions.push(transition);

            previousTransitionFinishDateTime =
              transitionStartDateTime + transition.getDurationInCalendarTime();

            fromColumn = toColumn;

            if (
              !story.getCommittedDate() &&
              toColumn.number >= columns.getCommittedColumn().number
            ) {
              story.setCommittedDate(timestamp);
            }
            if (
              !story.getDoneDate() &&
              toColumn.number >= columns.getDoneColumn().number
            ) {
              story.setDoneDate(timestamp);
            }
          } // if (transitionFields[fieldNo] !== '')
        } // for

        story.setTransitions(thisStorysTransitions);
        this.transitions.addTransitions(thisStorysTransitions);
        this.transitions.sort();
      } // if (storyLine != '' && storyLine.substr(1, 1) != delimiter)
    }); // forEach storyLine
  };

  /**************************************************************************
                              addStoriesFromJira
   **************************************************************************/
  /**
   * @memberof StoryCollection
   * @instance
   * @method addStoriesFromJira
   * @description Creates stories and their transitions and visual representations
   * based on an array of Jira issue data retrieved from the Jira REST API in
   * the calling functions.
   * @param issues An array of Jira issues retrieved
   * from the Jira REST API in the calling functions
   * @param columns A reference to the column collection, from which certain
   * information is needed when creating the transitions
   */
  this.addStoriesFromJira = (issues, columns, serverUrl) => {
    // Keep track of the maximum required token width needed to fit the longest
    // Jira key in the set of issues; at the end of the procedure, the width of
    // all tokens will be set to this width
    // var maxTokenWidth = 0;

    issues.forEach(issue => {
      const id = issue.key;
      const name = issue.fields.summary;
      const fields = issue.fields;
      const uncreatedColumn = columns.getUncreatedColumn();
      // Create a new Story...
      const story = new Story(
        id,
        name,
        fields,
        uncreatedColumn,
        serverUrl,
        animUtils
      );
      // ...and push it onto our list of stories in the current project
      this.stories.push(story);
      // Update our bookkeeping of the maximum token width, if needed
      // maxTokenWidth = Math.max(maxTokenWidth, story.token.tooltip.bbox().width);
      this.maxTokenStringWidth = Math.max(
        measureStringWidth(id, TOKEN_FONT),
        this.maxTokenStringWidth
      );

      // Create the story's transitions

      const thisStorysTransitions = [];
      var previousTransitionFinishDateTime = 0;

      // First create a "virtual" transition from uncreated column to the
      // fromColumn of the first real transition, timed at the time the issue was created
      var fromColumn = columns.getUncreatedColumn();
      var toColumn = columns.getFirstColumn();
      // Extract the timestamp when the issue was created to be used as the
      // timestamp of this transition; NB the time zone offset "+HHMM" in
      // the timestamp string must be reformatted to "+HH:MM" for Safari to accept it
      var timeStampString = issue.fields.created.replace(/(.+)(..)$/, '$1:$2');
      const createdDate = new Date(timeStampString).getTime();
      const transition = new Transition(
        story,
        fromColumn,
        toColumn,
        createdDate,
        createdDate
      );
      thisStorysTransitions.push(transition);

      // Set the committed date to the created date in case the first transition
      // goes directly to the committed column or beyond
      if (
        !story.getCommittedDate() &&
        toColumn.number >= columns.getCommittedColumn().number
      ) {
        story.setCommittedDate(createdDate);
      }
      // Set the done date to the created date in case the first transition
      // goes directly to the done column
      if (
        !story.getDoneDate() &&
        toColumn.number >= columns.getDoneColumn().number
      ) {
        story.setDoneDate(createdDate);
      }
      fromColumn = toColumn;
      // Record the moment when this transition finished. This is expressed in
      // calendar date/time since we don't know anything about animation times yet
      // until AnimationData.buildAnimation() has run. We will use this value when
      // creating subsequent transitions to make sure one transition doesn't
      // start before the prior one has had the time to finish.

      previousTransitionFinishDateTime =
        createdDate + transition.getDurationInCalendarTime();

      // The issue's transition history is found in the histories field of the
      // JSON response from the Jira REST API
      const histories = issue.changelog.histories;
      // Make sure the transitions are sorted in chronological order;
      // TODO: Is this really needed, do they always come sorted that way?
      histories.sort((firstHistory, secondHistory) => {
        if (new Date(firstHistory.created) >= new Date(secondHistory.created)) {
          return 1;
        } else {
          return -1;
        }
      });

      // Loop through the JSON response from the Jira REST API and create
      // status transitions based on the status transition information found
      histories.forEach(history => {
        history.items.forEach(item => {
          // look for the field that represents a status transition
          if (item.field === 'status') {
            // get the column (if any) that the toStatus is mapped to
            toColumn = columns.getColumnOfStatus(item.to);
            // Only create transitions when the issue is moving to a status
            // that has been mapped to a column (=toColumn is truthy) and the
            // column that this status is mapped to is different from the
            // current column of the issue
            if (toColumn && toColumn !== fromColumn) {
              // Extract the timestamp of this transition; NB the time zone
              // offset "+HHMM" in the timestamp string must be reformatted
              // to "+HH:MM" for Safari to accept it
              timeStampString = history.created.replace(/(.+)(..)$/, '$1:$2');
              const timestamp = new Date(timeStampString).getTime();
              // Set the transition to start at the timestamp, or at the finish
              // time of the previous transition, whichever is later; this way
              // we avoid that one transition would start before the previous one
              // has had the time to complete.
              const transitionStartDateTime = Math.max(
                timestamp,
                previousTransitionFinishDateTime
              );

              // Create the transition...
              const transition = new Transition(
                story,
                fromColumn,
                toColumn,
                timestamp,
                transitionStartDateTime
              );
              // ...and push it onto our list of the story's transitions
              thisStorysTransitions.push(transition);

              // Check if the story has reached the committed column and if so,
              // set the committed date if it wasn't set already
              if (
                !story.getCommittedDate() &&
                toColumn.number >= columns.getCommittedColumn().number
              ) {
                story.setCommittedDate(timestamp);
              }

              // Check if the story has reached the done column and if so,
              // set the done date if it wasn't set already
              if (
                !story.getDoneDate() &&
                toColumn.number >= columns.getDoneColumn().number
              ) {
                story.setDoneDate(timestamp);
              }

              // The destination column of this transition will be the starting
              // column of the next one
              fromColumn = toColumn;

              // Record the moment when this transition finished. This is expressed in
              // calendar date/time since we don't know anything about animation times yet
              // until Animation.buildAnimation() has run. We will use this value when
              // creating subsequent transitions to make sure one transition doesn't
              // start before the prior one has had the time to finish.
              previousTransitionFinishDateTime =
                transitionStartDateTime +
                transition.getDurationInCalendarTime();
            }
          }
        });
      });

      // Store all the generated transitions on the story...
      story.setTransitions(thisStorysTransitions);
      // ...and add them to the list of all transitions in the story collection
      this.transitions.addTransitions(thisStorysTransitions);
      this.transitions.sort();
      animUtils.animationStartDate = this.transitions.getFirstTransitionDate();
    });

    // Set width of each token to the width required to fit the widest label
    // this.stories.forEach(story => {
    //   story.token.circle.width(maxTokenWidth + ui.TOKEN_MARGIN);
    //   story.token.tooltip.cx(story.token.circle.cx());
    //   story.token.tooltip.cy(story.token.circle.cy());
    // });

    // Also inform the ui of the width of the tokens, since this is needed
    // when positioning the tokens on the ui
    // ui.labelWidth = maxTokenWidth + ui.TOKEN_MARGIN;
  };

  /**************************************************************************
                              getIterator
   **************************************************************************/
  /**
   * @memberof StoryCollection
   * @instance
   * @method getIterator
   * @description Generates an iterator over the stories in the story collection
   * TODO: No longer needed?
   */
  this.getIterator = function*() {
    for (var story of this.stories) {
      yield story;
    }
  };

  /**************************************************************************
                              asArray
   **************************************************************************/
  /**
   * @memberof StoryCollection
   * @instance
   * @method asArray
   * @description Returns an array with the stories in the story collection
   */
  this.asArray = function() {
    return this.stories;
  };

  /**************************************************************************
                        updateTokensAtAnimationTime
   **************************************************************************
    /**
     * @memberof StoryCollection
     * @instance
     * @method getTransitions
     * @description Returns an array with the transitions in the story collection
     */

  this.updateTokensAtAnimationTime = animationTime => {
    // Look for subsequent moves that should be active now
    if (animationTime >= this.previousAnimationTime) {
      // If animationTime moved forward (normal animation progress, or user
      // clicked or dragged the animation time forward),
      // we should be traversing the moves collection forward
      let nextMove;
      if (this.moves.activeMoves.head) {
        nextMove = this.moves.activeMoves.head.next;
      } else {
        nextMove = this.moves.first;
      }

      while (nextMove) {
        // Start from the latest added active move ("head") is one exists,
        // otherwise start from the first move in the MovesCollection
        if (nextMove.start <= animationTime) {
          this.moves.addToActiveMoves(nextMove);
        } else {
          break;
        }
        nextMove = nextMove.next;
      }
    } else {
      // If animationTime moved backwards (user
      // clicked or dragged the animation time backwards),
      // we should be traversing the moves collection backwards
      // Start from the latest added active move ("head") is one exists.
      // If no head exists, it would mean that no move has gotten activated yet,
      // which would be highly unlikely since the first move always starts at
      // animation time 0.
      if (this.moves.activeMoves.head) {
        let previousMove = this.moves.activeMoves.head.previous;
        while (previousMove) {
          if (
            previousMove.start + animUtils.TRANSITION_DURATION >=
            animationTime
          ) {
            this.moves.addToActiveMoves(previousMove);
          } else {
            break;
          }
          previousMove = previousMove.previous;
        }
      }
    }
    // Process the active moves and drop ones that should no longer be active
    for (let move of this.moves.getActiveMoves()) {
      const startX = move.fromColumn.number;
      const startY = move.fromSlot;
      const endX = move.toColumn.number;
      const endY = move.toSlot;
      const progressFactor = Math.max(
        Math.min((animationTime - move.start) / move.duration, 1),
        0
      );
      move.story.modelX = startX + progressFactor * (endX - startX);
      move.story.modelY = startY + progressFactor * (endY - startY);

      // Remove move from active moves after animation time has passed its end time
      if (animationTime > move.end || animationTime < move.start) {
        this.moves.removeFromActiveMoves(move);
      }
    }

    this.previousAnimationTime = animationTime;
  };

  /**************************************************************************
                            clear
   **************************************************************************
  /**
   * @memberof StoryCollection
   * @instance
   * @method clear
   * @description Clears and removes all stories from the story collection.
   * Used when clearing the data of a loaded project, including its stories,
   * before loading a new project with new stories. The story collection itself
   * does not get removed, only emptied of its stories.
   */
  this.clear = () => {
    this.stories.forEach(story => {
      story.clear();
      story = null;
    });
    this.stories.length = 0;
    this.transitions.clear();
    this.moves.clear();
  };
}

/**************************************************************************
                          Story Tokens
 **************************************************************************/

const TOKEN_HEIGHT = 18;
const TOKEN_FONT = 'Arial 10px';
const UNCREATED_COLUMN_X = -111;

function StoryTokens(props) {
  console.log('Render StoryTokens');
  const [selectedStory, setSelectedStory] = useState(undefined);

  // Set function on Move to give the x coordinate on the canvas of a column #
  // Column 0 is the "uncreated column", numbering of real columns starts from 1
  const columnToXCoord = useCallback(
    (modelX, tokenWidth) => {
      const xCoordOfColumn = columnNr => {
        return (
          props.margin +
          (columnNr - 1 + 0.5) * (props.width / props.columnCount) -
          tokenWidth / 2
        );
      };

      if (modelX < 1) {
        return (
          UNCREATED_COLUMN_X + modelX * (xCoordOfColumn(1) - UNCREATED_COLUMN_X)
        );
      } else {
        return xCoordOfColumn(modelX);
      }
    },
    [props.margin, props.width, props.columnCount]
  );

  // Set function on Move to give the y coordinate on the canvas of a vertical slot #
  // Assuming slot numbering starts from 0
  const slotToYCoord = slot => {
    return slot * TOKEN_HEIGHT;
  };

  Story.prototype.getTokenWidth = () =>
    props.stories.maxTokenStringWidth + ICON_WIDTH + 1.2 * TOKEN_HEIGHT;

  const handlePopupClose = () => {
    setSelectedStory(undefined);
  };

  const storyTokensStyle = {
    position: 'relative',
  };

  //  useEffect(() => {
  //    console.log('updateTokensAtAnimationTime');
  props.stories.updateTokensAtAnimationTime(props.animationTime);
  //  }, [props.animationTime, props.stories]);

  return (
    <div id="story-tokens" style={storyTokensStyle}>
      {props.stories.asArray().map(story => (
        <StoryToken
          story={story}
          columnToXCoord={columnToXCoord}
          slotToYCoord={slotToYCoord}
          key={story.id}
          animationTime={props.animationTime}
          selected={selectedStory === story}
          setSelectedStory={setSelectedStory}
        />
      ))}
      <StoryPopup
        story={selectedStory}
        handleClose={handlePopupClose}
        windowDimensions={props.windowDimensions}
      />
    </div>
  );
}

function StoryToken(props) {
  const appearance = props.story.getAppearanceAtAnimationTime(
    props.animationTime
  );

  const tokenWidth = props.story.getTokenWidth();
  const left = props.columnToXCoord(props.story.modelX, tokenWidth);
  const bottom = props.slotToYCoord(props.story.modelY);

  const tokenCommonStyle = {
    position: 'absolute',
    left: left,
    bottom: bottom,
    width: tokenWidth,
    font: TOKEN_FONT,
    borderRadius: TOKEN_HEIGHT / 2,
    border: 'solid',
    backgroundColor: appearance.fillColor,
    color: appearance.fontColor,
    opacity: appearance.opacity,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '1px',
    cursor: 'pointer',
    boxSizing: 'borderBox',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const tokenUnSelectedStyle = {
    borderWidth: '1px',
    borderColor: '#111',
    zIndex: 1,
  };

  const tokenSelectedStyle = {
    borderWidth: '2px',
    borderColor: '#FD0',
    zIndex: 2,
  };

  const tokenSelectionStyle = props.selected
    ? tokenSelectedStyle
    : tokenUnSelectedStyle;

  const iconStyle = {
    margin: '0px 4px',
    width: '20%',
    height: '20%',
  };

  const handleClick = () => {
    if (!props.selected) {
      props.setSelectedStory(props.story);
    } else {
      props.setSelectedStory(null);
    }
  };

  return (
    <div
      key={props.story.id}
      style={{ ...tokenCommonStyle, ...tokenSelectionStyle }}
      onClick={handleClick}
    >
      <img
        src={props.story.fields.issuetype.iconUrl}
        className={'icon'}
        alt={props.story.fields.issuetype.name}
        style={iconStyle}
      />
      <div>{props.story.id}</div>
    </div>
  );
}

export default memo(StoryTokens);
