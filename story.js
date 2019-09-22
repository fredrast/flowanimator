import { Transition } from './transition.js';
import { stringToDateTime } from './utils.js';

/****************************************************************************
                                 STORY
 ****************************************************************************/

// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
function Story(id, name, column, ui) {
  this.id = id;
  this.name = name;
  var committedDate = null;
  var doneDate = null;
  this.column = column;
  this.column.storiesInColumn.push(this);
  this.verticalSlot = this.column.storiesInColumn.indexOf(this);

  this.token = ui.getToken(this);

  this.getTransitions = () => {
    return transitions;
  };

  this.setTransitions = transitions => {
    this.transitions = transitions;
  };

  this.setCommittedDate = timestamp => {
    committedDate = timestamp;
  };

  this.setDoneDate = timestamp => {
    doneDate = timestamp;
  };

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

  this.getCommittedDate = () => {
    return committedDate;
  };

  this.getDoneDate = () => {
    return doneDate;
  };

  this.clear = () => {
    this.token.clear();
    this.token = null;
    transitions.length = 0;
  };
}

/****************************************************************************
                             STORY COLLECTION
 ****************************************************************************/

export function StoryCollection() {
  const stories = [];
  this.publicStories = stories;
  var allTransitions = []; // needs to be var since we'll be using .concat

  /**************************************************************************
                            addStoriesFromFile
   **************************************************************************/

  this.addStoriesFromFile = (
    storyLines,
    delimiter,
    attribute_fields_in_import_file,
    columns,
    ui
  ) => {
    //  Read and create stories and column transitions from subsequent lines in file
    storyLines.forEach(storyLine => {
      if (storyLine != '' && storyLine.substr(1, 1) != delimiter) {
        // disregard any possible empty lines, or lines consisting only of delimiters, which may be found at the end of the file

        const storyFields = storyLine.split(delimiter);
        const id = storyFields[0];
        const name = storyFields[2];
        const column = columns.getUncreatedColumn();
        const story = new Story(id, name, column, ui);
        stories.push(story);

        // Create the story's transitions
        const transitionFields = storyFields.slice(
          attribute_fields_in_import_file
        );
        const thisStorysTransitions = [];
        var committedDate;
        var doneDate;
        var fromColumn = columns.getUncreatedColumn();
        var previousTransitionFinishDateTime = 0;

        for (var fieldNo = 0; fieldNo < transitionFields.length; fieldNo++) {
          if (transitionFields[fieldNo] != '') {
            // disregard empty fields

            const toColumn = columns.getColumn(fieldNo + 1); // column numbering starts from 1 since columns[0] is the uncreated column
            const timestamp = stringToDateTime(
              transitionFields[fieldNo]
            ).getTime();

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

            previousTransitionFinishDateTime =
              transitionStartDateTime +
              Transition.transitionDurationToDateTime();

            thisStorysTransitions.push(transition);
            fromColumn = toColumn;

            if (
              !committedDate &&
              toColumn.number >= columns.committedColumn.number
            ) {
              story.setCommittedDate(timestamp);
            }
            if (!doneDate && toColumn.number >= columns.doneColumn.number) {
              story.setDoneDate(timestamp);
            }
          } // if (transitionFields[fieldNo] != '')
        } // for

        story.setTransitions(thisStorysTransitions);
        allTransitions = allTransitions.concat(thisStorysTransitions);
      } // if (storyLine != '' && storyLine.substr(1, 1) != delimiter)
    }); // forEach storyLine
  };

  /**************************************************************************
                            addStoriesFromJira
   **************************************************************************/

  this.addStoriesFromJira = (issues, columns, ui) => {
    console.log(issues);
    issues.forEach(issue => {
      const id = issue.key;
      const name = issue.fields.summary;
      const column = columns.getUncreatedColumn();
      const story = new Story(id, name, column, ui);

      // Create the story's transitions
      const thisStorysTransitions = [];
      var committedDate;
      var doneDate;
      var fromColumn = columns.getUncreatedColumn();
      var previousTransitionFinishDateTime = 0;
      issue.changelog.histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field == 'column') {
            // const toColumn =
            // BOOKMARK
            // must be able to identify the right column object
            // must consider how these are numbered in the jira data
            // must store the correct jira numbers in the column objects
            // so that they can be referred to
            // must also consider the distinction between columns and columns
            // must disregard any transitions to and from columns that are
            // not mapped to any column on the board
            //
            // const transition = new Transition(
            //   story,
            //   fromColumn,
            //   toColumn,
            //   timestamp,
            //   transitionStartDateTime
            // );
          }
        });
      });
    });
    // issues.forEach(issue => {
    //   issueList.push({toColumn: issue.})
    //   const columnTransitions = issue.changelog.histories.filter(
    //     historyEntry => {
    //       historyEntry.items.filter(item => (item.field = 'column'))
    //         .length > 0;
    //   const toColumn = transitionFields[fieldNo].toColumn;
    //   const timestamp = transitionFields[fieldNo].timestamp;
  };

  this.getIterator = function*() {
    for (var story of stories) {
      yield story;
    }
  };

  this.getTransitions = () => {
    return transitions;
  };

  this.clear = () => {
    stories.forEach(story => {
      story.clear();
      story = null;
    });
    stories.length = 0;
    allTransitions.length = 0;
  };
}
