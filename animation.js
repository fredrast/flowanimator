import { Transition, TransitionCollection } from './transition.js';
import { Status } from './status.js';
import { Story } from './story.js';
import { stringToDate } from './utils.js';

// import { timeline } from './timeline.js';

export function Animation(ui, timeline) {
  const DATE_FORMAT = 'dd.mm.yyyy';
  const UNCREATED_SLOT = 0;
  const UNCREATED_STATUS_ID = 0;
  const TRANSITION_DURATION = 200;
  const DROP_DURATION = 100;
  const DROP_DELAY = 15;
  const DAY_IN_MS = 86400000;
  const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the JIRA import file before the transitions start
  const DELIMITER = ';';

  var projectDuration;
  var animationDuration;
  var animationDurationEstimate;
  const storyCollection = [];
  var uncreatedStatus = {};

  const transitions = new TransitionCollection();
  const statuses = [];

  this.ui = ui;
  timeline.setOnTime(e => {
    // Move the slider button forward in accordance with the progress
    // of the animation
    ui.setProgressBar(e.detail / timeline.getEndTime());

    // Determining the date of the current point in the animation

    ui.setAnimationDate(
      new Date(
        transitions.getFirstTransitionTime_ms() +
          (e.detail / animationDurationEstimate) * transitions.getTimespan_ms()
      )
    );

    // Put our internal playing status to false if the last runner has completed
    // i.e. we have reached the end of the timeline
    if (timeline.isDone()) {
      ui.animationPlaying = false;
    }
  });

  /******************************************************************************/
  /*            LOADING NEW FILE AND CREATING ANIMATION                         */
  /******************************************************************************/

  // Parse the first line of the input file holding the statuses
  // and create status objects for each encountered status
  const addStatuses = statusLine => {
    uncreatedStatus = new Status(0, 'Uncreated');
    statuses.push(uncreatedStatus);
    var fields = statusLine.split(';');

    for (
      var fieldNo = ATTRIBUTE_FIELDS_IN_IMPORT_FILE; // start looping through fields where the transition fields start i.e. after the story attribute fields
      fieldNo < fields.length;
      fieldNo++
    ) {
      const statusNo = fieldNo - ATTRIBUTE_FIELDS_IN_IMPORT_FILE + 1; // status number 0 used for uncreates status, hence +1

      if (fields[fieldNo] != '') {
        // disregard any empty fields
        const status = new Status(fieldNo, fields[fieldNo]);

        statuses.push(status);
      }
    }
    this.ui.addStatuses(statuses);
  };

  // Clear the current statuses, stories, transitions and timeline
  // before a new input file gets read
  const clearPreviousProject = () => {
    statuses.forEach(status => {
      status.clear();
      status = null;
    });
    statuses.length = 0;
    storyCollection.forEach(story => {
      story.clear();
      story = null;
    });
    storyCollection.length = 0;
    transitions.clear();

    timeline._runners.length = 0;

    this.ui.reset();
  };

  // Read the input file and initiate the generation of statuses, stories and
  // transitions found in the file
  this.readStoriesAndTransitionsFromFile = file => {
    // Prepare a FileReader to read the contents of the file
    var reader = new FileReader();
    // What to do once the FileReader is done opening the file
    reader.onload = e => {
      // /* console.log('Executing readStoriesAndTransitionsFromFile'); */
      var contents = e.target.result;

      clearPreviousProject(); // Now's the time to clear the previous project
      var lines = contents.match(/[^\r\n]+/g);

      addStatuses(lines[0]); // Read and create statuses from first line in file

      //  Read and create stories and status transitions from subsequent lines in file
      for (var lineNo = 1; lineNo < lines.length; lineNo++) {
        if (lines[lineNo] != '') {
          // disregard any possible empty lines, which may be found at the end of the file

          const lineFields = lines[lineNo].split(DELIMITER);

          const storyFields = lineFields.slice(
            0,
            ATTRIBUTE_FIELDS_IN_IMPORT_FILE
          );

          const story = new Story(
            storyFields,
            statuses[UNCREATED_STATUS_ID],
            UNCREATED_SLOT,
            this.ui
          );
          storyCollection.push(story);
          const transitionFields = lineFields.splice(
            ATTRIBUTE_FIELDS_IN_IMPORT_FILE
          );
          createTransitions(story, transitionFields);
        }
      }

      transitions.sort();

      // Launch the building of the animation based on the status transitions

      buildAnimation();

      return true; // TODO add error handling in case the reading and parsing of the file somehow fails
    };

    // Done preparing the FileReader, now time to execute it
    reader.readAsText(file);
  };

  const createTransitions = (story, transitionTimestamps) => {
    // Create the story's transitions and push them onto the transitions array
    var fromStatus = story.initialStatus;
    for (var fieldNo = 0; fieldNo < transitionTimestamps.length; fieldNo++) {
      if (transitionTimestamps[fieldNo] != '') {
        // disregard any empty fields
        const toStatus = statuses[fieldNo + 1]; // status numbering starts from 1 since statuses[0] is the uncreated status
        const transition = new Transition(
          story,
          fromStatus,
          toStatus,
          stringToDate(transitionTimestamps[fieldNo], DATE_FORMAT) // timestamp
        );

        transitions.push(transition);
        fromStatus = toStatus;
      }
    }
  };

  // Build the animation timeline with the stories' status transitions
  // based on the status transitions in the transitions object
  function buildAnimation() {
    // Determine the timespan of the transitions from first to last -- since they
    // were just sorted by timestamp, we can find the first transition as the
    // first element in the Array and the last transition as the last element
    // firstTransitionTime_ms = transitions[0].timeStamp.getTime();
    // lastTransitionTime_ms = transitions[
    //   transitions.length - 1
    // ].timeStamp.getTime();
    // projectTimespan_ms =
    //   lastTransitionTime_ms - firstTransitionTime_ms + DAY_IN_MS; // another day for the last-day transitions to complete
    // projectDuration =
    //   projectTimespan *
    //   (ANIMATION_DURATION / (ANIMATION_DURATION - TRANSITION_DURATION));

    animationDuration = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
      (transitions.getTimespan_ms() / DAY_IN_MS) * TRANSITION_DURATION * 2 +
      TRANSITION_DURATION;

    animationDurationEstimate = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
      (transitions.getTimespan_ms() / DAY_IN_MS) * TRANSITION_DURATION * 2;

    /* console.log(
      'transitions.getTimespan_ms(): ' + transitions.getTimespan_ms()
    ); */
    /* console.log('animationDuration: ' + animationDuration); */

    function setIntervalAsync(fn, delay, callback) {
      fn().then(promiseResponse => {
        if (!promiseResponse.done) {
          setTimeout(() => setIntervalAsync(fn, delay, callback), delay);
        } else {
          callback();
        }
      });
    }

    const animationGenerator = AnimationGenerator();

    setIntervalAsync(
      async () => {
        return animationGenerator.next();
      },
      0,
      () => {
        // Callback function called upon completion of the generator
        ui.setAnimationDuration(animationDuration);
        ui.enablePlayControls();
      }
    );
  }

  function* AnimationGenerator() {
    for (var transition of transitions.getIterator()) {
      const storyToMove = transition.story;
      /* console.log('storyToMove: '); */
      /* console.log(storyToMove); */
      const fromStatus = storyToMove.status;
      var fromSlot = storyToMove.verticalSlot;
      const toStatus = transition.toStatus;
      toStatus.storiesInStatus.push(storyToMove);
      const toSlot = toStatus.storiesInStatus.indexOf(storyToMove);

      // Make new stories fly in vertically by positioning them
      // on the height of their destination slot
      if (fromStatus == uncreatedStatus) {
        fromSlot = toSlot;
        storyToMove.token.elements.y(ui.slotToYCoord(toSlot));
      }

      // Determine where the transition should be positioned on the timeline
      // This is based on the time stamp of the transition in proportion to
      // the entire timespan that the timeline represents.
      // We also want to make sure that the next transition animation
      // of an issue token doesn't start before
      // a) the previous animation of that issue token
      // b) any previous animations in toStatus
      // have been completed.
      // Hence the max function to get the largest of the calculated starting
      // point, the record of the finishing point of the previous transition,
      // and the finishing point of the previous animation to or from the toStatus

      const transitionStartOnTimeline = Math.max(
        ((transition.getTimeStamp_ms() -
          transitions.getFirstTransitionTime_ms()) /
          DAY_IN_MS) *
          TRANSITION_DURATION *
          2,
        storyToMove.previousTransitionAnimationFinish,
        storyToMove.previousDropAnimationFinish,
        transitions.getPreviousInAnimationFinishInToStatus(transition) -
          TRANSITION_DURATION,
        transitions.getPreviousOutAnimationFinishInToStatus(transition) -
          TRANSITION_DURATION,
        transitions.getPreviousInAnimationFinishInFromStatus(transition),
        transitions.getPreviousOutAnimationFinishInFromStatus(transition) -
          TRANSITION_DURATION
      );

      // /* console.log('transitionStartOnTimeline: ' + transitionStartOnTimeline); */
      // /* console.log(
      //   'formula: ' +
      //     ((transition.getTimeStamp_ms() -
      //       transitions.getFirstTransitionTime_ms()) /
      //       DAY_IN_MS) *
      //       TRANSITION_DURATION *
      //       2
      // ); */
      // /* console.log(
      //   'storyToMove.previousTransitionAnimationFinish: ' +
      //     storyToMove.previousTransitionAnimationFinish
      // ); */
      // /* console.log(
      //   'storyToMove.previousDropAnimationFinish: ' +
      //     storyToMove.previousDropAnimationFinish
      // ); */
      // /* console.log(
      //   'transitions.getPreviousInAnimationFinishInToStatus(transition): ' +
      //     transitions.getPreviousInAnimationFinishInToStatus(transition)
      // ); */

      storyToMove.previousTransitionAnimationFinish =
        transitionStartOnTimeline + TRANSITION_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds
      transition.previousAnimationFinish =
        transitionStartOnTimeline + TRANSITION_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds

      storyToMove.token.elements
        .animate(TRANSITION_DURATION, transitionStartOnTimeline, 'absolute')
        .move(ui.statusToXCoord(toStatus), ui.slotToYCoord(toSlot));

      /* console.log(''); */
      /* console.log('Moving story ' + storyToMove.name); */
      /* console.log(
        'to (' +
          ui.statusToXCoord(toStatus) +
          ',' +
          ui.slotToYCoord(toSlot) +
          ')'
      ); */
      /* console.log('@ ' + transitionStartOnTimeline); */

      storyToMove.status = toStatus;

      storyToMove.verticalSlot = toSlot;

      fromStatus.storiesInStatus.splice(fromSlot, 1); // Take out the story that just transitioned out

      // Perform drops on the stories in fromStatus that were above the
      // story that transitioned out
      const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);

      if (fromStatus != uncreatedStatus) {
        // No need to perform drop operation on stories in uncreated status
        storiesToDrop.forEach(storyToDrop => {
          const dropFromSlot = storyToDrop.verticalSlot;
          const dropToSlot = storyToDrop.verticalSlot - 1;
          const dropStartOnTimeLine = Math.max(
            // Make sure the animation doesn't start before any possible ongoing animation has finished
            transitionStartOnTimeline + DROP_DELAY,
            storyToDrop.previousDropAnimationFinish
          );

          storyToDrop.previousDropAnimationFinish =
            dropStartOnTimeLine + DROP_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds

          storyToDrop.token.elements
            .animate(DROP_DURATION, dropStartOnTimeLine, 'absolute')
            .y(ui.slotToYCoord(dropToSlot));
          storyToDrop.verticalSlot = dropToSlot;
        });
      }

      // The last transitions in the project may get pushed forward beyond our
      // original estimated animationduration; in such cases we want to extend
      // the animationDuration accordingly so that it's as long as the actual animation
      // timeline
      animationDuration = Math.max(animationDuration, timeline.getEndTime());

      const progressPercentage = timeline.getEndTime() / animationDuration;

      console.log(
        timeline.getEndTime() +
          ' ' +
          animationDuration +
          ' ' +
          progressPercentage
      );

      ui.setAnimationLoad(progressPercentage);

      /* console.log(
        animationDuration +
          ' ' +
          timeline.getEndTime() +
          ' ' +
          timeline.getEndTime() / animationDuration
      ); */

      if (!ui.animationPlaying) {
        timeline.pause();
      }

      yield 'Another transition processed'; // Return value for debug purposes
    }

    return 'All transitions processed'; // Return value for debug purposes
  }
}
