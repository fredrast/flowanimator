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
  this.committedDate = null;
  this.doneDate = null;
  this.column = column;
  this.column.storiesInColumn.push(this);
  this.verticalSlot = this.column.storiesInColumn.indexOf(this);
  this.transitions = [];
  this.token = ui.getToken(this);
  this.previousTransitionAnimationFinish = 0;
  this.committedDate = null;
  this.doneDate = null;

  this.setTransitions = transitions => {
    this.transitions = transitions;
  };

  this.getTransitions = () => {
    return this.transitions;
  };

  this.setCommittedDate = timestamp => {
    this.committedDate = timestamp;
  };

  this.getCommittedDate = () => {
    return this.committedDate;
  };

  this.setDoneDate = timestamp => {
    this.doneDate = timestamp;
  };

  this.getDoneDate = () => {
    return this.doneDate;
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

  this.clear = () => {
    this.token.clear();
    this.token = null;
    this.transitions.length = 0;
  };
}

/****************************************************************************
                             STORY COLLECTION
 ****************************************************************************/

export function StoryCollection() {
  this.stories = [];
  this.transitions = []; // needs to be var since we'll be using .concat

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
        this.stories.push(story);

        // Create the story's transitions
        const transitionFields = storyFields.slice(
          attribute_fields_in_import_file
        );
        const thisStorysTransitions = [];
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
              toColumn.number >= columns.committedColumn.number
            ) {
              story.setCommittedDate(timestamp);
            }
            if (
              !story.getDoneDate() &&
              toColumn.number >= columns.doneColumn.number
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

  this.addStoriesFromJira = (issues, columns, ui) => {
    /* console.log(issues); */
    issues.forEach(issue => {
      console.log('New issue entry: ' + issue.key);
      /* console.log(issue); */
      const id = issue.key;
      const name = issue.fields.summary;
      /* console.log('Created ' + id + ' ""' + name + '"'); */
      const uncreatedColumn = columns.getUncreatedColumn();
      const story = new Story(id, name, uncreatedColumn, ui);
      this.stories.push(story);

      // Create the story's transitions
      const thisStorysTransitions = [];
      var committedDate = null;
      var doneDate = null;
      var previousTransitionFinishDateTime = 0;

      //  first create a "virtual" transition from uncreated column to the fromColumn of the first real transition, timed at the time the issue was created
      var fromColumn = columns.getUncreatedColumn();
      var toColumn = columns.getFirstColumn();
      const createdDate = new Date(issue.fields.created).getTime();

      const transition = new Transition(
        story,
        fromColumn,
        toColumn,
        createdDate,
        createdDate
      );
      thisStorysTransitions.push(transition);
      /* console.log(transition); */
      if (
        !story.getCommittedDate() &&
        toColumn.number >= columns.committedColumn.number
      ) {
        story.setCommittedDate(createdDate);
      }
      if (
        !story.getDoneDate() &&
        toColumn.number >= columns.doneColumn.number
      ) {
        story.setDoneDate(createdDate);
      }
      fromColumn = toColumn;
      previousTransitionFinishDateTime =
        createdDate + Transition.transitionDurationToDateTime();

      const histories = issue.changelog.histories;
      histories.sort((firstHistory, secondHistory) => {
        if (new Date(firstHistory.created) >= new Date(secondHistory.created)) {
          return 1;
        } else {
          return -1;
        }
      });

      histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field == 'status') {
            // this history field represents a status transition

            toColumn = columns.getColumnOfStatus(item.to); // get the column (if any) that the toStatus is mapped to

            if (toColumn && toColumn !== fromColumn) {
              // only create transitions when we are moving to a different column
              const timestamp = new Date(history.created).getTime();
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
              /* console.log(transition); */

              if (
                !story.getCommittedDate() &&
                toColumn.number >= columns.committedColumn.number
              ) {
                story.setCommittedDate(timestamp);
              }
              if (
                !story.getDoneDate() &&
                toColumn.number >= columns.doneColumn.number
              ) {
                story.setDoneDate(timestamp);
              }

              fromColumn = toColumn;
              previousTransitionFinishDateTime =
                transitionStartDateTime +
                Transition.transitionDurationToDateTime();
            }
          }
        });
      });
      /* console.log('Transitions of ' + id + ':'); */
      /* console.log(thisStorysTransitions); */
      story.setTransitions(thisStorysTransitions);
      /* console.log(story); */
      this.transitions = this.transitions.concat(thisStorysTransitions);
      /* console.log('All transitions up until now:'); */
      /* console.log(this.transitions); */
    });
  };

  this.getIterator = function*() {
    for (var story of this.stories) {
      yield story;
    }
  };

  this.getTransitions = () => {
    return this.transitions;
  };

  this.clear = () => {
    this.stories.forEach(story => {
      story.clear();
      story = null;
    });
    this.stories.length = 0;
    this.transitions.length = 0;
  };
}
