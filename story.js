import { Transition } from './transition.js';
import { stringToDateTime } from './utils.js';

/****************************************************************************
                                 STORY
 ****************************************************************************/

// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
function Story(id, name, status, ui) {
  this.id = id;
  this.name = name;
  var committedDate = null;
  var doneDate = null;
  this.status = status;
  this.status.storiesInStatus.push(this);
  this.verticalSlot = this.status.storiesInStatus.indexOf(this);

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
    statuses,
    ui
  ) => {
    //  Read and create stories and status transitions from subsequent lines in file
    storyLines.forEach(storyLine => {
      if (storyLine != '' && storyLine.substr(1, 1) != delimiter) {
        // disregard any possible empty lines, or lines consisting only of delimiters, which may be found at the end of the file

        const storyFields = storyLine.split(delimiter);
        const id = storyFields[0];
        const name = storyFields[2];
        const status = statuses.getUncreatedStatus();
        const story = new Story(id, name, status, ui);
        stories.push(story);

        // Create the story's transitions
        const transitionFields = storyFields.slice(
          attribute_fields_in_import_file
        );
        const thisStorysTransitions = [];
        var committedDate;
        var doneDate;
        var fromStatus = statuses.getUncreatedStatus();
        var previousTransitionFinishDateTime = 0;

        for (var fieldNo = 0; fieldNo < transitionFields.length; fieldNo++) {
          if (transitionFields[fieldNo] != '') {
            // disregard empty fields

            const toStatus = statuses.getStatus(fieldNo + 1); // status numbering starts from 1 since statuses[0] is the uncreated status
            const timestamp = stringToDateTime(
              transitionFields[fieldNo]
            ).getTime();

            const transitionStartDateTime = Math.max(
              timestamp,
              previousTransitionFinishDateTime
            );

            const transition = new Transition(
              story,
              fromStatus,
              toStatus,
              timestamp,
              transitionStartDateTime
            );

            previousTransitionFinishDateTime =
              transitionStartDateTime +
              Transition.transitionDurationToDateTime();

            thisStorysTransitions.push(transition);
            fromStatus = toStatus;

            if (
              !committedDate &&
              toStatus.number >= statuses.committedStatus.number
            ) {
              story.setCommittedDate(timestamp);
            }
            if (!doneDate && toStatus.number >= statuses.doneStatus.number) {
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

  this.addStoriesFromJira = (issues, statuses, ui) => {
    console.log(issues);
    issues.forEach(issue => {
      const id = issue.key;
      const name = issue.fields.summary;
      const status = statuses.getUncreatedStatus();
      const story = new Story(id, name, status, ui);

      // Create the story's transitions
      const thisStorysTransitions = [];
      var committedDate;
      var doneDate;
      var fromStatus = statuses.getUncreatedStatus();
      var previousTransitionFinishDateTime = 0;
      issue.changelog.histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field == 'status') {
            // const toStatus =
            // BOOKMARK
            // must be able to identify the right status object
            // must consider how these are numbered in the jira data
            // must store the correct jira numbers in the status objects
            // so that they can be referred to
            // must also consider the distinction between statuses and columns
            // must disregard any transitions to and from statuses that are
            // not mapped to any column on the board
            //
            // const transition = new Transition(
            //   story,
            //   fromStatus,
            //   toStatus,
            //   timestamp,
            //   transitionStartDateTime
            // );
          }
        });
      });
    });
    // issues.forEach(issue => {
    //   issueList.push({toStatus: issue.})
    //   const statusTransitions = issue.changelog.histories.filter(
    //     historyEntry => {
    //       historyEntry.items.filter(item => (item.field = 'status'))
    //         .length > 0;
    //   const toStatus = transitionFields[fieldNo].toStatus;
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
