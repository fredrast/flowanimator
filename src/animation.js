import { Transition, TransitionCollection } from './transition.js';
import { Column, ColumnCollection, UNCREATED_COLUMN_ID } from './column.js';
import { StoryCollection } from './story.js';
import { setIntervalAsync, msToTime } from './utils.js';
import { getBoardFromJira, getIssuesFromJira } from './jira.js';

const TRANSITION_DURATION = 200;
const DROP_DURATION = 100;
const DROP_DELAY = 1;
const DAY_IN_MS = 86400000;
const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the Jira import file before the transitions start
const DELIMITER = ';';
const AGE_COLORING_MAX_AGE = 30 * DAY_IN_MS;

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

  const columns = new ColumnCollection();
  const stories = new StoryCollection();
  const transitions = new TransitionCollection();

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

    // Put our internal playing column to false if the last runner has completed
    // i.e. we have reached the end of the timeline
    if (timeline.isDone()) {
      ui.animationPlaying = false;
    }
  });

  /*****************************************************************************
                          clearPreviousProject
  ******************************************************************************/
  // Clear the current columns, stories, transitions and timeline
  // before a new input file gets read

  const clearPreviousProject = () => {
    columns.clear();
    stories.clear();
    transitions.clear();
    timeline._runners.length = 0;
    ui.reset();
    ui.clearCalendarTimeline();
  };

  /*****************************************************************************
                      readProjectDataFromFile
  ******************************************************************************/
  // Read the input file and initiate the generation of columns, stories and
  // transitions found in the file
  this.readProjectDataFromFile = file => {
    /* console.log('Starting readStoriesAndTransitionsFromFile'); */
    // Prepare a FileReader to read the contents of the file
    var reader = new FileReader();
    // What to do once the FileReader is done opening the file
    reader.onload = e => {
      clearPreviousProject(); // Now's the time to clear the previous project
      const fileContents = e.target.result;
      var lines = fileContents.match(/[^\r\n]+/g);

      const columnFields = lines[0]
        .split(DELIMITER)
        .slice(ATTRIBUTE_FIELDS_IN_IMPORT_FILE);
      columns.addColumnsFromFile(columnFields); // Read and create columns from first line in file
      ui.addColumns(columns.getColumns()); // Pass an array of the created columns to the ui object for the creation of column labels on the screen
      stories.addStoriesFromFile(
        // Read and create stories from the subsequent lines in the file
        lines.slice(1),
        DELIMITER,
        ATTRIBUTE_FIELDS_IN_IMPORT_FILE,
        columns,
        ui
      );

      transitions.addTransitions(stories.getTransitions());
      /* console.log('Before sort:'); */
      /* console.log(transitions); */
      transitions.sort();
      /* console.log('After sort:'); */
      /* console.log(transitions); */
      /* console.log('Done creating stories and transitions!'); */
      /* console.log(stories); */
      /* console.log(transitions); */

      // Launch the building of the animation based on the column transitions
      buildAnimation();

      return true; // TODO add error handling in case the reading and parsing of the file somehow fails
    };

    // Done preparing the FileReader, now time to execute it
    reader.readAsText(file);
    return true; // TODO Add error handling
  };

  /*****************************************************************************
                      readProjectDataFromJira
  ******************************************************************************/

  this.readProjectDataFromJira = (
    serverUrl,
    id,
    token,
    boardId,
    resolve,
    reject
  ) => {
    getBoardFromJira(serverUrl, id, token, boardId).then(boardConf => {
      clearPreviousProject();
      columns.addColumnsFromJira(boardConf.columnConfig.columns);
      ui.addColumns(columns.getColumns());

      const filterId = boardConf.filter.id;
      const issuesUrl =
        serverUrl + '/rest/agile/1.0/board/' + boardId + '/issue';

      const issuesPromise = getIssuesFromJira(serverUrl, id, token, filterId);
      console.log('Got issuesPromise:');
      console.log(issuesPromise);
      issuesPromise
        .then(issues => {
          console.log('Got issues from Jira:');
          console.log(issues);
          stories.addStoriesFromJira(issues, columns, ui);
          transitions.addTransitions(stories.getTransitions());
          transitions.sort();
          resolve(); // stop the spinner and close the modal

          buildAnimation();
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  /*****************************************************************************
                          buildAnimation
  ******************************************************************************/

  // Build the animation timeline with the stories' column transitions
  // based on the column transitions in the transitions object
  function buildAnimation() {
    animationDuration = // Up-front estimate, may still increase if there are postponed transitions at the end of the project
      dateTimeToAnimationTime(transitions.getTimespan()) + TRANSITION_DURATION;

    ui.setAnimationDuration(animationDuration);
    ui.drawCalendarTimeline(
      new Date(transitions.getFirstTransitionDate()),
      new Date(transitions.getLastTransitionDate())
    );

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

    generateColorAnimation();
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

      // Take the story out of its previous column
      const fromColumn = storyToMove.column;
      var fromSlot = storyToMove.verticalSlot;

      fromColumn.storiesInColumn.splice(fromSlot, 1); // Take out the story that just transitioned out

      // Put the story into its next column
      const toColumn = transition.toColumn;
      toColumn.storiesInColumn.push(storyToMove);
      const toSlot = toColumn.storiesInColumn.indexOf(storyToMove);
      storyToMove.column = toColumn;
      storyToMove.verticalSlot = toSlot;

      // Animate the transition

      // Make new stories fly in vertically by positioning them
      // on the height of their destination slot
      if (fromColumn.number == UNCREATED_COLUMN_ID) {
        fromSlot = toSlot;
        storyToMove.token.elements.y(ui.slotToYCoord(toSlot));
      }

      storyToMove.token.elements
        .animate(TRANSITION_DURATION, transitionStartOnTimeline, 'absolute')
        .move(ui.columnToXCoord(toColumn), ui.slotToYCoord(toSlot));

      storyToMove.previousAnimationFinish =
        transitionStartOnTimeline + TRANSITION_DURATION;

      // Perform drops on the stories in fromColumn that were above the
      // story that transitioned out
      const storiesToDrop = fromColumn.storiesInColumn.slice(fromSlot);

      if (fromColumn.number != UNCREATED_COLUMN_ID) {
        // No need to perform drop operation on stories in uncreated column
        storiesToDrop.forEach(storyToDrop => {
          const dropFromSlot = storyToDrop.verticalSlot;
          const dropToSlot = storyToDrop.verticalSlot - 1;

          var dropStartOnTimeLine = transitionStartOnTimeline + DROP_DELAY; // DEBUG

          if (dropStartOnTimeLine < storyToDrop.previousAnimationFinish) {
            dropStartOnTimeLine = storyToDrop.previousAnimationFinish; // TODO rewrite using Math.max once the if-clause is no longer needed for the /* /* /* /* /* /* console.logs
          }

          // Animate the drop
          // but only do so if there is time for the drop animation
          // to finish before the next out transition of the dropped story is to start
          const nextTransitionOfDropStory = storyToDrop.getNextTransition(
            transition
          );

          if (
            !nextTransitionOfDropStory ||
            nextTransitionOfDropStory.getTransitionStartOnTimeline() >
              dropStartOnTimeLine + DROP_DURATION
          ) {
            storyToDrop.token.elements
              .animate(DROP_DURATION, dropStartOnTimeLine, 'absolute')
              .y(ui.slotToYCoord(dropToSlot));
            /* console.log('Executing drop of ' + storyToDrop.id); */
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
    /* console.log('All transitions processed'); */
    return 'All transitions processed'; // Return value for debug purposes
  }

  /****************************************************************************
                        generateColorAnimation
   ****************************************************************************/
  function generateColorAnimation() {
    // indicate age of story by color
    /* console.log('Starting color animation!'); */
    for (var story of stories.getIterator()) {
      /* console.log(story); */
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
      } else {
        // DEBUG
        /* console.log('No committed date of story ' + story.id); */
      }
    }
    /* console.log('Done with color animation!'); */
  }
}
