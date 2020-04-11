/**
 * @file src/story.js
 * @description Defines the [Story]{@link Story} class for representing the stories to
 * be animated, and the [StoryCollecction]{@link StoryCollection} class for creating the stories
 * and holding the list of stories and performing certain operations on them.
 */
import { Transition } from "./transition.js";
import { utils } from "./utils.js";
import { Move } from "./timeline.js";

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
 * @param ui Reference to the ui object to enable a visual token
 * representing the story to be created onto the ui
 */
function Story(id, name, initialColumn, ui) {
  this.id = id;
  this.name = name;
  this.committedDate = null;
  this.doneDate = null;
  this.column = initialColumn;
  this.initialColumn = this.column;
  // Add this story to the list of stories in the column where this story is
  // initially placed...
  this.column.storiesInColumn.push(this);
  // ...and take note of the vertical slot in which this story landed in that column
  this.verticalSlot = this.column.storiesInColumn.indexOf(this);
  this.initialVerticalSlot = this.verticalSlot;
  this.transitions = [];
  // Generate a token i.e. a visual representation of this story on the ui,
  // and store the reference for future use
  this.token = ui.getToken(this);
  this.previousTransitionAnimationFinish = 0;
  this.committedDate = null;
  this.doneDate = null;
  this.moves = [];

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

  /**
   * @memberof Story
   * @instance
   * @method addMove
   * @description
   */
  this.addMove = (start, duration, fromColumn, toColumn, fromSlot, toSlot) => {
    this.moves.push(
      new Move(this, start, duration, fromColumn, toColumn, fromSlot, toSlot)
    );
    console.log();
  };

  /**
   * @memberof Story
   * @instance
   * @method getMoveAtOrBeforeAnimationMoment
   * @description
   */

  this.moveToken = (fromColumn, fromSlot, toColumn, toSlot, progressFactor) => {
    const startX = ui.columnToXCoord(fromColumn);
    const startY = ui.slotToYCoord(fromSlot);
    const endX = ui.columnToXCoord(toColumn);
    const endY = ui.slotToYCoord(toSlot);
    const x = startX + progressFactor * (endX - startX);
    const y = startY + progressFactor * (endY - startY);
    this.token.elements.move(x, y);
  };

  this.setTokenVisibility = visible => {
    if (visible) {
      this.showToken();
    } else {
      this.hideToken();
    }
  };

  this.showToken = () => {
    this.token.elements.opacity(1);
  };

  this.hideToken = () => {
    this.token.elements.opacity(0);
  };

  /**
   * @memberof Story
   * @instance
   * @method clear
   * @description Clear this story's token. Used when clearing the data of a
   * loaded project, including its stories, before loading a new project with
   * new stories.
   */
  this.clear = () => {
    this.token.clear();
    this.token = null;
    this.transitions.length = 0;
    this.moves.length = 0;
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
export function StoryCollection() {
  this.stories = [];
  this.transitions = []; // needs to be var since we'll be using .concat

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
    columns,
    ui
  ) => {
    //  Read and create stories and column transitions from subsequent lines in file
    storyLines.forEach(storyLine => {
      if (storyLine != "" && storyLine.substr(1, 1) != delimiter) {
        // disregard any possible empty lines, or lines consisting only of delimiters, which may be found at the end of the file

        const storyFields = storyLine.split(delimiter);
        const id = storyFields[0];
        const name = storyFields[2];
        const column = columns.getUncreatedColumn();
        const story = new Story(id, name, column, ui);
        this.stories.push(story);

        // Create the story's transitions
        const transitionFields = storyFields.slice(
          attribute_fields_in_import_file
        );
        const thisStorysTransitions = [];
        var fromColumn = columns.getUncreatedColumn();
        var previousTransitionFinishDateTime = 0;

        for (var fieldNo = 0; fieldNo < transitionFields.length; fieldNo++) {
          if (transitionFields[fieldNo] != "") {
            // disregard empty fields

            const toColumn = columns.getColumn(fieldNo + 1); // column numbering starts from 1 since columns[0] is the uncreated column
            const timestamp = utils
              .stringToDateTime(transitionFields[fieldNo])
              .getTime();

            const transitionStartDateTime = Math.max(
              timestamp,
              previousTransitionFinishDateTime
            );

            thisStorysTransitions.push(
              new Transition(
                story,
                fromColumn,
                toColumn,
                timestamp,
                transitionStartDateTime
              )
            );

            previousTransitionFinishDateTime =
              transitionStartDateTime +
              Transition.transitionDurationToDateTime();

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
          } // if (transitionFields[fieldNo] != '')
        } // for

        story.setTransitions(thisStorysTransitions);
        this.transitions = this.transitions.concat(thisStorysTransitions);
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
   * @param ui A reference to the ui object, needed in order to be able to
   * add a token, i.e. a visual representation of the story, onto the ui
   */
  this.addStoriesFromJira = (issues, columns, ui) => {
    // Keep track of the maximum required token width needed to fit the longest
    // Jira key in the set of issues; at the end of the procedure, the width of
    // all tokens will be set to this width
    var maxTokenWidth = 0;

    issues.forEach(issue => {
      const id = issue.key;
      const name = issue.fields.summary;
      const uncreatedColumn = columns.getUncreatedColumn();
      // Create a new Story...
      const story = new Story(id, name, uncreatedColumn, ui);
      // ...and push it onto our list of stories in the current project
      this.stories.push(story);
      // Update our bookkeeping of the maximum token width, if needed
      maxTokenWidth = Math.max(maxTokenWidth, story.token.tooltip.bbox().width);

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
      var timeStampString = issue.fields.created.replace(/(.+)(..)$/, "$1:$2");
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
      // until Animation.buildAnimation() has run. We will use this value when
      // creating subsequent transitions to make sure one transition doesn't
      // start before the prior one has had the time to finish.
      previousTransitionFinishDateTime =
        createdDate + Transition.transitionDurationToDateTime();

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
          if (item.field == "status") {
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
              timeStampString = history.created.replace(/(.+)(..)$/, "$1:$2");
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
                Transition.transitionDurationToDateTime();
            }
          }
        });
      });

      // Store all the generated transitions on the story...
      story.setTransitions(thisStorysTransitions);
      // ...and add them to the list of all transitions in the story collection
      this.transitions = this.transitions.concat(thisStorysTransitions);
    });

    // Set width of each token to the width required to fit the widest label
    this.stories.forEach(story => {
      story.token.circle.width(maxTokenWidth + ui.TOKEN_MARGIN);
      story.token.tooltip.cx(story.token.circle.cx());
      story.token.tooltip.cy(story.token.circle.cy());
    });

    // Also inform the ui of the width of the tokens, since this is needed
    // when positioning the tokens on the ui
    ui.labelWidth = maxTokenWidth + ui.TOKEN_MARGIN;
  };

  /**************************************************************************
                              getIterator
   **************************************************************************/
  /**
   * @memberof StoryCollection
   * @instance
   * @method getIterator
   * @description Generates an iterator over the stories in the story collection
   */
  this.getIterator = function*() {
    for (var story of this.stories) {
      yield story;
    }
  };

  /**************************************************************************
                              getTransitions
   **************************************************************************
    /**
     * @memberof StoryCollection
     * @instance
     * @method getTransitions
     * @description Returns an array with the transitions in the story collection
     */
  this.getTransitions = () => {
    return this.transitions;
  };

  /**************************************************************************
                        updateTokensAtAnimationMoment
   **************************************************************************
    /**
     * @memberof StoryCollection
     * @instance
     * @method getTransitions
     * @description Returns an array with the transitions in the story collection
     */

  this.updateTokensAtAnimationMoment = animationMoment => {
    this.stories.forEach(story => {
      story.updatePosition(animationMoment);
    });
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
    this.transitions.length = 0;
  };
}
