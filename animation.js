import { Transition, TransitionCollection } from './transition.js';
import { Status, StatusCollection, UNCREATED_STATUS_ID } from './status.js';
import { Story, StoryCollection } from './story.js';
import { msToTime } from './utils.js';

const TRANSITION_DURATION = 200;
const DROP_DURATION = 100;
const DROP_DELAY = 1;
const DAY_IN_MS = 86400000;
const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the JIRA import file before the transitions start
const DELIMITER = ';';
const AGE_COLORING_MAX_AGE = 100 * DAY_IN_MS;

// import { timeline } from './timeline.js';
const dateTimeToAnimationTime = dateTimeInMs => {
  return (dateTimeInMs / DAY_IN_MS) * TRANSITION_DURATION * 2;
};

const animationTimeToDateTime = animationTime => {
  return (animationTime * DAY_IN_MS) / (TRANSITION_DURATION * 2);
};

Transition.dateTimeToAnimationTime = dateTimeToAnimationTime;
Transition.transitionDurationToDateTime = () => (1 / 2) * DAY_IN_MS;

export function Animation(ui, timeline) {
  var projectDuration;
  var animationDuration;
  // var animationDurationEstimate;

  const statuses = new StatusCollection();
  const stories = new StoryCollection();
  const transitions = new TransitionCollection();

  this.ui = ui;

  timeline.setOnTime(e => {
    // Move the slider button forward in accordance with the progress
    // of the animation
    ui.setProgressBar(e.detail / timeline.getEndTime());

    // Determining the date of the current point in the animation

    ui.setAnimationDate(
      new Date(
        transitions.getFirstTransitionDate() +
          (e.detail / animationDuration) * transitions.getTimespan()
      )
    );

    ui.setAnimationTime(e.detail);

    // Put our internal playing status to false if the last runner has completed
    // i.e. we have reached the end of the timeline
    if (timeline.isDone()) {
      ui.animationPlaying = false;
    }
  });

  /******************************************************************************/
  /*            LOADING NEW FILE AND CREATING ANIMATION                         */
  /******************************************************************************/

  // Clear the current statuses, stories, transitions and timeline
  // before a new input file gets read

  const clearPreviousProject = () => {
    statuses.clear();
    stories.clear();
    transitions.clear();

    timeline._runners.length = 0;

    // this.ui.reset();
  };

  // Read the input file and initiate the generation of statuses, stories and
  // transitions found in the file
  this.readStoriesAndTransitionsFromFile = file => {
    console.log('Starting readStoriesAndTransitionsFromFile');
    // Prepare a FileReader to read the contents of the file
    var reader = new FileReader();
    // What to do once the FileReader is done opening the file
    reader.onload = e => {
      clearPreviousProject(); // Now's the time to clear the previous project
      const fileContents = e.target.result;
      var lines = fileContents.match(/[^\r\n]+/g);

      const statusFields = lines[0]
        .split(DELIMITER)
        .slice(ATTRIBUTE_FIELDS_IN_IMPORT_FILE);
      statuses.addStatuses(statusFields); // Read and create statuses from first line in file
      this.ui.addStatuses(statuses.getStatuses()); // Pass an array of the created statuses to the ui object for the creation of status labels on the screen
      stories.addStories(
        // Read and create stories from the subsequent lines in the file
        lines.slice(1),
        DELIMITER,
        ATTRIBUTE_FIELDS_IN_IMPORT_FILE,
        statuses,
        ui
      );

      transitions.addTransitions(stories.getTransitions());
      transitions.sort();
      console.log('Done creating stories and transitions!');
      console.log(stories);
      console.log(transitions);

      // Launch the building of the animation based on the status transitions
      buildAnimation();

      return true; // TODO add error handling in case the reading and parsing of the file somehow fails
    };

    // Done preparing the FileReader, now time to execute it
    reader.readAsText(file);
    return true; // TODO Add error handling
  };

  // Build the animation timeline with the stories' status transitions
  // based on the status transitions in the transitions object
  function buildAnimation() {
    animationDuration = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
      dateTimeToAnimationTime(transitions.getTimespan()) + TRANSITION_DURATION;

    ui.setAnimationDuration(animationDuration);

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
      }
    );

    console.log('Starting color animation');
    // indicate age of story by color
    for (var story of stories.getIterator()) {
      if (story.getCommittedDate()) {
        // only color stories that have gotten committed

        const animationStartDate = story.getCommittedDate();
        const animationEndDate = story.getDoneDate()
          ? story.getDoneDate()
          : transitions.getLastTransitionDate();
        const animationDateSpan = animationEndDate - animationStartDate;

        const colorAnimationStart = dateTimeToAnimationTime(
          animationStartDate - transitions.getFirstTransitionDate()
        );
        const colorAnimationLength = dateTimeToAnimationTime(animationDateSpan);
        const finalGreenAndBlueValue =
          (1 - Math.min(animationDateSpan / AGE_COLORING_MAX_AGE, 1)) * 255;

        story.token.circle
          .animate(colorAnimationLength, colorAnimationStart, 'absolute')
          .attr({
            fill: new SVG.Color({
              r: 255,
              g: finalGreenAndBlueValue,
              b: finalGreenAndBlueValue,
            }),
          });
        if (!ui.animationPlaying) {
          timeline.pause();
        }

        console.log(
          colorAnimationStart +
            ', ' +
            colorAnimationLength +
            ', ' +
            finalGreenAndBlueValue
        );
      } else {
        // DEBUG
        console.log('No committed date of story ' + story.id);
      }
    }
    console.log('Done with color animation!');
  }

  /****************************************************************************
                           AnimationGenerator
   ****************************************************************************/

  function* AnimationGenerator() {
    var maxEndTime = 0;
    for (var transition of transitions.getIterator()) {
      // Determine where the transition should be positioned on the timeline
      // This is based on the time stamp of the transition in proportion to
      // the entire timespan that the timeline represents.

      const transitionStartOnTimeline = dateTimeToAnimationTime(
        transition.getTransitionStartDateTime() -
          transitions.getFirstTransitionDate()
      );

      const storyToMove = transition.story;

      // Take the story out of its previous status
      const fromStatus = storyToMove.status;
      var fromSlot = storyToMove.verticalSlot;

      // DEBUG
      console.log(
        '**************  [' +
          msToTime(transitionStartOnTimeline) +
          '->' +
          msToTime(transitionStartOnTimeline + TRANSITION_DURATION) +
          '] Moving ' +
          storyToMove.id +
          ' out from ' +
          fromStatus.name +
          ' >>>>>>>>>>>>>>'
      );
      // console.log(fromStatus.storiesInStatus);

      fromStatus.storiesInStatus.splice(fromSlot, 1); // Take out the story that just transitioned out

      // DEBUG

      fromStatus.storiesInStatus.forEach(story => {
        console.log(story.id + ' in slot ' + story.verticalSlot);
      });
      // console.log(fromStatus.storiesInStatus);

      // Put the story into its next status
      const toStatus = transition.toStatus;

      // DEBUG

      console.log(
        '>>>>>>>>>>>>>>  [' +
          msToTime(transitionStartOnTimeline) +
          '->' +
          msToTime(transitionStartOnTimeline + TRANSITION_DURATION) +
          '] Moving ' +
          storyToMove.id +
          ' in to ' +
          toStatus.name +
          ' **************'
      );
      // console.log(toStatus.storiesInStatus);

      toStatus.storiesInStatus.push(storyToMove);
      const toSlot = toStatus.storiesInStatus.indexOf(storyToMove);
      storyToMove.status = toStatus;
      storyToMove.verticalSlot = toSlot;

      // DEBUG
      toStatus.storiesInStatus.forEach(story => {
        console.log(story.id + ' in slot ' + story.verticalSlot);
      });
      // console.log(toStatus.storiesInStatus);
      // DEBUG

      // Animate the transition

      // Make new stories fly in vertically by positioning them
      // on the height of their destination slot
      if (fromStatus.number == UNCREATED_STATUS_ID) {
        fromSlot = toSlot;
        storyToMove.token.elements.y(ui.slotToYCoord(toSlot));
      }

      storyToMove.token.elements
        .animate(TRANSITION_DURATION, transitionStartOnTimeline, 'absolute')
        .move(ui.statusToXCoord(toStatus), ui.slotToYCoord(toSlot));

      storyToMove.previousAnimationFinish =
        transitionStartOnTimeline + TRANSITION_DURATION;

      // Perform drops on the stories in fromStatus that were above the
      // story that transitioned out
      const storiesToDrop = fromStatus.storiesInStatus.slice(fromSlot);

      if (fromStatus.number != UNCREATED_STATUS_ID) {
        // No need to perform drop operation on stories in uncreated status
        storiesToDrop.forEach(storyToDrop => {
          const dropFromSlot = storyToDrop.verticalSlot;
          const dropToSlot = storyToDrop.verticalSlot - 1;

          // const dropStartOnTimeLine = Math.max(
          //   // Make sure the drop animation doesn't start before any possible ongoing animation of the story to drop has finished
          //   transitionStartOnTimeline + DROP_DELAY,
          //   storyToDrop.previousAnimationFinish
          // );

          var dropStartOnTimeLine = transitionStartOnTimeline + DROP_DELAY; // DEBUG
          console.log(
            'VVVVVVVVVVVVVV [' +
              msToTime(dropStartOnTimeLine) +
              '->' +
              msToTime(dropStartOnTimeLine + DROP_DURATION) +
              '] Dropping ' +
              storyToDrop.id +
              ' from ' +
              dropFromSlot +
              ' to ' +
              dropToSlot +
              ' in status ' +
              fromStatus.number
          );

          if (dropStartOnTimeLine < storyToDrop.previousAnimationFinish) {
            dropStartOnTimeLine = storyToDrop.previousAnimationFinish; // TODO rewrite using Math.max once the if-clause is no longer needed for the console.logs

            console.log(
              '############## [' +
                msToTime(transitionStartOnTimeline) +
                '] ' +
                storyToMove.id +
                ' => ' +
                toStatus.number +
                ': ' +
                storyToDrop.id +
                ' not finished with animation to ' +
                storyToDrop.status.number
            );
            console.log(
              storyToDrop.id +
                ': ' +
                msToTime(storyToDrop.previousAnimationFinish) +
                ' > ' +
                msToTime(dropStartOnTimeLine)
            );
          }

          // Animate the drop
          // but only do so if there is time for the drop animation
          // to finish before the next out transition of the dropped story is to start
          const nextTransitionOfDropStory = storyToDrop.getNextTransition(
            transition
          );
          console.log(
            'Examining drop of ' + storyToDrop.id + ' in ' + fromStatus.number
          );
          console.log(nextTransitionOfDropStory);
          console.log(dropStartOnTimeLine + DROP_DURATION);

          if (
            !nextTransitionOfDropStory ||
            nextTransitionOfDropStory.getTransitionStartOnTimeline() >
              dropStartOnTimeLine + DROP_DURATION
          ) {
            storyToDrop.token.elements
              .animate(DROP_DURATION, dropStartOnTimeLine, 'absolute')
              .y(ui.slotToYCoord(dropToSlot));
            console.log('Executing drop of ' + storyToDrop.id);
          }
          storyToDrop.verticalSlot = dropToSlot;
          storyToDrop.previousAnimationFinish =
            dropStartOnTimeLine + DROP_DURATION; // Keep track of when this animation ends, to be used in subsequent rounds
        });
      }

      // Keep track of how far the animation has extended so far, in order to
      // set the load bar accordingly
      // NB in the current version of this application, the transitions should
      // get processed in an order where transitionStartOnTimeline
      // of each transition is always larger than or equal to that of the
      // previous transition, hence the use of the max function here should not
      // actually be necessary anymore; TODO: confirm this and remove the max statement
      maxEndTime = Math.max(
        maxEndTime,
        transitionStartOnTimeline + TRANSITION_DURATION
      );

      // The last transitions in the project may get pushed forward beyond our
      // original estimated animationduration; in such cases we want to extend
      // the animationDuration accordingly so that it's as long as the actual animation
      // timeline

      animationDuration = Math.max(animationDuration, maxEndTime);

      const progressPercentage = maxEndTime / animationDuration;

      ui.setAnimationLoad(progressPercentage);

      if (!ui.animationPlaying) {
        // the timeline seems to start auto-playing whenever new animations are being added;
        // that should be prevented, unless we are in a playing mode already
        timeline.pause();
      }
      yield 'Another transition processed'; // Return value for debug purposes
    }
    console.log('All transitions processed');
    return 'All transitions processed'; // Return value for debug purposes
  }
}
