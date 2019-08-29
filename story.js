import { Transition } from './transition.js';
import { stringToDate } from './utils.js';

/****************************************************************************
                                 STORY
 ****************************************************************************/

// Constructor for objects to represent the stories in the current project
// Read in a line from the input file and create the story and the story's
// transitions found on the line
export function Story(storyFields, transitionFields, statuses, ui) {
  // Initiate the properties of the story

  this.id = storyFields[0];
  this.link = storyFields[1];
  this.name = storyFields[2];
  this.uniqueID = Math.round(100 * Math.random());

  this.status = statuses.getUncreatedStatus();
  this.status.storiesInStatus.push(this);
  this.verticalSlot = this.status.storiesInStatus.indexOf(this);

  this.token = ui.getToken(this);
  /* console.log(this.token); */

  // this.previousTransitionAnimationFinish = 0; // Used during animation build, holding the timestamp when the prior transitionanimation was finished to avoid that next transition or drop animation starts before previous is finished
  this.previousDropAnimationFinish = 0; // As above, for previous drop animation

  const transitions = [];
  var committedDate;
  var doneDate;

  // Create the story's transitions
  var fromStatus = statuses.getUncreatedStatus();
  var previousTransitionFinishDateTime = 0;

  for (var fieldNo = 0; fieldNo < transitionFields.length; fieldNo++) {
    if (transitionFields[fieldNo] != '') {
      // disregard any empty fields
      const toStatus = statuses.getStatus(fieldNo + 1); // status numbering starts from 1 since statuses[0] is the uncreated status
      const timestamp = stringToDate(transitionFields[fieldNo]).getTime();
      const transitionStartDateTime = Math.max(
        timestamp,
        previousTransitionFinishDateTime
      );

      const transition = new Transition(
        this,
        fromStatus,
        toStatus,
        timestamp,
        transitionStartDateTime
      );

      previousTransitionFinishDateTime =
        transitionStartDateTime + Transition.transitionDurationToDateTime();

      transitions.push(transition);
      fromStatus = toStatus;

      if (
        !committedDate &&
        toStatus.number >= statuses.committedStatus.number
      ) {
        committedDate = timestamp;
      }
      if (!doneDate && toStatus.number >= statuses.doneStatus.number) {
        doneDate = timestamp;
      }
    }
  }

  this.getTransitions = () => {
    return transitions;
  };

  this.getNextTransition = baselineTransition => {
    // Return the first of this story's transitions that comes after the baseline transition in sort order
    // Assuming that this story's transitions have been pushed onto the transitions array
    // in the order of the timestamps
    for (var i = 0; i < transitions.length; i++) {
      const transition = transitions[i];
      if (transition.getSortOrder(transition, baselineTransition) > 0) {
        return transition;
      }
    }
  };

  this.getCommittedDate = () => {
    return committedDate ? committedDate : null;
  };

  this.getDoneDate = () => {
    return doneDate ? doneDate : null;
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
  var transitions = [];

  this.addStories = (
    storyLines,
    delimiter,
    attribute_fislds_in_import_file,
    statuses,
    ui
  ) => {
    //  Read and create stories and status transitions from subsequent lines in file
    storyLines.forEach(storyLine => {
      if (storyLine != '' && storyLine.substr(1, 1) != delimiter) {
        // disregard any possible empty lines, which may be found at the end of the file

        const storyFields = storyLine.split(delimiter);
        const attributeFields = storyFields.slice(
          0,
          attribute_fislds_in_import_file
        );
        const transitionFields = storyFields.slice(
          attribute_fislds_in_import_file
        );

        const story = new Story(storyFields, transitionFields, statuses, ui);

        stories.push(story);

        transitions = transitions.concat(story.getTransitions());
      }
    });
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
    transitions.length = 0;
  };
}
