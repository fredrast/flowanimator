/**
 * @file src/animation.js
 * @description Defines the {@link Animation} class that provides functionality for reading
 * workflow, issue and transition data from a source (Jira server, possibly
 * other sources in the future) and for generating the animation of the
 * issues and their transitions
 */

import { Transition, TransitionCollection } from './transition.js';
import { Column, ColumnCollection, UNCREATED_COLUMN_ID } from './column.js';
import { StoryCollection } from './story.js';
import { utils } from './utils.js';
import { jira } from './jira.js';
import { Move, Timeline } from './timeline.js';

/**
 * @constructor Animation
 * @description Provides functionality for reading workflow, issue and transition
 * data from a source (Jira server, possibly other sources in the future)
 * and for generating the animation of the issues and their transitions.
 * @param ui {object} A reference to the ui object (instantiated in index.js)
 * @param timeline {object} A reference to the timeline object, which is shared between
 * the Animation and Ui classes (instantiated in index.js)
 */
export function Animation(ui, timeline) {
  const TRANSITION_DURATION = 200;
  const DROP_DURATION = 100;
  const DROP_DELAY = 1;
  const CALENDAR_DAY_IN_MS = 86400000;
  const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the Jira import file before the transitions start
  const DELIMITER = ';';
  const AGE_COLORING_MAX_AGE = 180 * CALENDAR_DAY_IN_MS;

  const columns = new ColumnCollection();
  const stories = new StoryCollection();
  const transitions = new TransitionCollection();

  var animationDuration;

  timeline.setEventHandler(timelineEvent => {
    // Move the slider button forward in accordance with the progress
    // of the animation
    ui.setProgressBar(timelineEvent.progress);

    // Display the real-life date/time represented by the current progress
    // of the animation
    ui.setAnimationDate(
      new Date(
        transitions.getFirstTransitionDate() +
          timelineEvent.progress * transitions.getTimespan()
      )
    );

    // Display the current progress in seconds of the animation
    ui.setAnimationTime(timelineEvent.time);

    // When the last runner of the animation timeline has completed, the
    // animation playback is automatically halted. We should then update
    // our own playing status indicator accordingly.
    if (timelineEvent.timelineDone) {
      ui.animationPlaying = false;
    }
  });

  /**
   * @memberof Animation
   * @inner
   * @method
   * @description Converts real calendar date/time values (in microseconds) to
   * their corresponding time values (in microseconds) on the animation timeline.
   * @param dateTimeInMs The real-life date/time, expressed in Unix Epoch
   * milliseconds i.e. milliseconds since 1.1.1970
   */
  const calendarDaysToAnimationTime = dateTimeInMs => {
    return (dateTimeInMs / CALENDAR_DAY_IN_MS) * TRANSITION_DURATION * 2;
  };

  /**
   * @memberof Animation
   * @inner
   * @method
   * @description Converts a moment in ms on the animation timeline to the
   * corresponding real-life date/time in Unix Epoch  milliseconds
   * i.e. milliseconds since 1.1.1970
   * @param animationTime A moment in ms on the animation timeline
   */
  const animationTimeToDateTime = animationTime => {
    return (animationTime * CALENDAR_DAY_IN_MS) / (TRANSITION_DURATION * 2);
  };

  // Lend some conversion functions to the Transition class
  Transition.calendarDaysToAnimationTime = calendarDaysToAnimationTime;
  Transition.transitionDurationToDateTime = () => (1 / 2) * CALENDAR_DAY_IN_MS;

  /****************************************************************************
                      clearPreviousProject
  *****************************************************************************/
  /**
   * @memberof Animation
   * @inner
   * @method clearPreviousProject
   * @description Clear the current columns, stories, transitions and timeline
   * before a new input file gets read. Called from **readProjectDataFromJira**
   * and **readProjectDataFromFile**
   */
  const clearPreviousProject = () => {
    columns.clear();
    stories.clear();
    transitions.clear();
    timeline.clear();
    ui.reset();
    ui.clearCalendarTimeline();
  };

  /****************************************************************************
                      readProjectDataFromFile
  *****************************************************************************/
  /**
   * @memberof Animation
   * @instance
   * @method readProjectDataFromFile
   * @description Read input from a file and initiate the generation of columns,
   * stories and transitions found in the file. NOT IN USE CURRENTLY.
   * @param file Input file selected by user, transmitted from ui
   */
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
  /**
   * @memberof Animation
   * @instance
   * @method readProjectDataFromJira
   * @description Read input from a Jira server and initiate the generation of
   * columns, stories and transitions found in the file. Called from **ui.js**
   * when user has completed the modal dialog for selecting Jira server and board.
   * @param serverUrl Url of Jira server given by user, including possible proxy url
   * @param id User id for authentication against Jira REST API, given by user
   * @param token Password or API Token for authentication against Jira REST API, given by user
   * @param boardId Id (as defined in Jira REST API) of agile board selected by user
   * @param resolve Callback to be called upon successful completion of call to
   * Jira REST API, resolves promise in calling function
   * @param reject Callback to be called upon any failure, rejects promise in calling function
   */
  this.readProjectDataFromJira = (
    serverUrl,
    id,
    token,
    boardId,
    resolve,
    reject
  ) => {
    // Obtain and execute a promise from reading the configuration (columns and
    // mapped statuses) of the selected Jira board from the Jira REST API
    jira.getBoardFromJira(serverUrl, id, token, boardId).then(boardConf => {
      // Now we are past the "point of no return" in opening a new project
      // and should clear out the data of the previously opened project, if any
      clearPreviousProject();
      // Add the columns found in the board configuration to our column collection...
      columns.addColumnsFromJira(boardConf.columnConfig.columns);
      // ... and display labels for these columns on the ui
      ui.addColumns(columns.getColumns());
      // The id of the Jira issue filter used in the board
      const filterId = boardConf.filter.id;
      // Obtain and execute a promise from reading the issues of the selected
      // Jira board from the Jira REST API
      jira
        .getIssuesFromJira(serverUrl, id, token, filterId)
        .then(issues => {
          // Create new Story objects and add to our story collection
          // and to the ui
          stories.addStoriesFromJira(issues, columns, ui);
          // Add the stories' transitions to our transition collection
          transitions.addTransitions(stories.getTransitions());
          // Sort the transitions from oldest to newest, since
          // transitions.getFirstTransitionDate(), .getLastTransitionDate() and
          // .getTimespan() later on require and assume that the transition array
          // is sorted. This way we don't need to do the sorting more than once.
          transitions.sort();
          // Resolve the promise created in the calling function in ui.js,
          // this stops the spinner and closes the modal.
          resolve();
          // Continue to the building of the animation based on the data
          // we just read in
          buildAnimation();
        })
        .catch(error => {
          // In case of any error, reject the promise created in the calling
          // function in ui.js
          reject(error);
        });
    });
  };

  /*****************************************************************************
                          buildAnimation
  ******************************************************************************/
  /**
   * @memberof Animation
   * @inner
   * @function buildAnimation
   * @description Build the animation timeline with the stories' column transitions
   * based on the column transitions in the transitions object. Called from
   * **readProjectDataFromJira**.
   */
  function buildAnimation() {
    // Calculate the coming duration of the animation (in milliseconds);
    // this is an estimate that may still increase if there is "congestion"
    // at the end of the animation that causes some transitions to be postponed
    // beyond the original end of the project.
    animationDuration =
      calendarDaysToAnimationTime(transitions.getTimespan()) +
      TRANSITION_DURATION;
    // Inform the ui about the estimated animation duration, which is used
    // for mapping between the progress of the animation and the progress
    // of the progress bar/slider.
    ui.setAnimationDuration(animationDuration);
    // Draw the calendar timeline on the ui
    ui.drawCalendarTimeline(
      new Date(transitions.getFirstTransitionDate()),
      new Date(transitions.getLastTransitionDate())
    );
    // Next, run the generation of the animation. This can take severa minutes,
    // and we don't want the ui to be frozen during that time. Therefore, we
    // will use a mechanism that yields control to the rest of the application
    // after each round in the animation generation. This is based on using
    // a) a Generator function
    // b) an async version of setInterval, as proposed by Jason Yu in comments
    // section of https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9

    // First, instantiate the generator function that generates the animation step by step
    const animationGenerator = AnimationGenerator();
    // Then, launch the async version of setInterval, which executes the next
    // round of the generator function at each interval; between each
    // execution, control gets yielded to the rest of the application
    utils.setIntervalAsync(
      // async function to be executed
      async () => {
        // Execute next round of the generator
        return animationGenerator.next();
      },
      // Interval between executions
      0,
      // Callback function called by setIntervalAsync upon completion of the generator
      () => {
        // Inform the ui about the final duration of the animation, which
        // was arrived at by the completion of the animation generation. This
        // may be a little longer than the initial estimate in case there was
        // "congestion" at the end of the animation that caused some transitions
        // to be postponed beyond the original end of the project.
        ui.setAnimationDuration(animationDuration);
        timeline.sort();
      }
    );
    // Launch the procedure to color the stories according to their age
    generateColorAnimation();
    // Activate the play/pause and stop buttons now that the generation of
    // the animation has started. Since the animation generation runs
    // in an asynchronous mode, it is probably not finished yet by the time this
    // code executes. However, we want to enable the user to start playing
    // the animation already while it's being generated, hence we enable the
    // controls already at this point.
    ui.enablePlayControls();
  }

  /****************************************************************************
                           AnimationGenerator
   ****************************************************************************/
  /**
   * @memberof Animation
   * @inner
   * @method AnimationGenerator
   * @description Generator function that generates the animation i.e. the
   * movements of the stories between the columns of the board, according to
   * the status transitions of the stories in the Jira project. The generator
   * function gets triggered by setIntervalAsync launched in **buildAnimation**
   * and generates the animation of the next status transition in the transitions
   * collection, after which it yields back the control to the rest of the application.
   * It then gets retriggered by setIntervalAsync and this continues until
   * the generator has generated the animation of each status transition in the
   * transitions collection. This way we avoid freezing the ui while the
   * animation generation is running.
   */
  function* AnimationGenerator() {
    var maxEndTime = 0;
    for (var transition of transitions.getIterator()) {
      // Determine where the transition should be positioned on the timeline.
      // This is based on the time stamp of the transition in proportion to
      // the entire timespan that the timeline represents.
      const transitionStartOnTimeline = calendarDaysToAnimationTime(
        transition.getTransitionStartDateTime() -
          transitions.getFirstTransitionDate()
      );

      const storyToMove = transition.story;

      // The story's currently recorded column is the column from which the
      // animation should start
      const fromColumn = storyToMove.column;
      // The transition's destination column is the column where the
      // animation should end
      const toColumn = transition.toColumn;
      // The story's currently recorded vertical slot is the slot from which the
      // animation should start
      var fromSlot = storyToMove.verticalSlot;
      // Remove the story from the list of stories in the column that it's
      // moving out from
      fromColumn.storiesInColumn.splice(fromSlot, 1);
      // Add the story to the list of stories in the column that it's moving into
      toColumn.storiesInColumn.push(storyToMove);
      // Check which vertical slot of the new column the story landed in
      const toSlot = toColumn.storiesInColumn.indexOf(storyToMove);
      // Record on the story the new column that it moved into...
      storyToMove.column = toColumn;
      // ...as well as the new vertical slot; we will need these values again
      // when we animate the next transition of this story.
      storyToMove.verticalSlot = toSlot;

      // Now, animate the transition:

      // If this is the first transition of the story, we should do a few things
      if (fromColumn.number == UNCREATED_COLUMN_ID) {
        // First, set the starting slot equal to the destination slot since we
        // want to make stories fly in horisontally in their first transition.
        fromSlot = toSlot;
      }
      /* console.log(storyToMove.id + ' ' + fromSlot + ' ' + toSlot); */
      // Then, fade in the token as it flies in onto the visible board
      // storyToMove.token.circle
      //   .animate(
      //     TRANSITION_DURATION / 2,
      //     transitionStartOnTimeline,
      //     'absolute'
      //   )
      //   .opacity(1);
      // storyToMove.token.tooltip
      //   .animate(
      //     TRANSITION_DURATION / 2,
      //     transitionStartOnTimeline,
      //     'absolute'
      //   )
      //   .opacity(1);

      // Move the token from its current column & slot to the new ones
      // storyToMove.token.elements
      //   .animate(TRANSITION_DURATION, transitionStartOnTimeline, 'absolute')
      //   .center(
      //     ui.columnToXCoord(transition.toColumn),
      //     ui.slotToYCoord(toSlot)
      //   );

      timeline.addMove(
        storyToMove,
        'move',
        transitionStartOnTimeline,
        TRANSITION_DURATION,
        fromColumn,
        toColumn,
        fromSlot,
        toSlot
      );

      // Record the ending time of this transition on the story; we will refer
      // to this value later on if the story is getting dropped
      storyToMove.previousAnimationFinish =
        transitionStartOnTimeline + TRANSITION_DURATION;

      // Next we shoud drop downwards any stories in the starting column that
      // were above the story that moved out. However, there is no need to
      // perform any drops on stories in the first invisible "uncreated" column,
      // so drops are only to be performed if the column that the story moved
      // out of is any other than the "uncreated" column.
      if (fromColumn.number != UNCREATED_COLUMN_ID) {
        // Form a list of any stories at or above the slot of the story that just
        // moved out
        const storiesToDrop = fromColumn.storiesInColumn.slice(fromSlot);
        storiesToDrop.forEach(storyToDrop => {
          // The animation should start in the story's current vertical slot...
          const dropFromSlot = storyToDrop.verticalSlot;
          // ...and end in one slot below
          const dropToSlot = storyToDrop.verticalSlot - 1;
          // The drop animation should start a brief moment later than the
          // main animation of the story that moved out and caused the drop. If
          // the previous animation of the story being dropped hasn't yet
          // finished by then, we should delay the start until the completion
          // of this prior transition, which we recorded on the story when this
          // transition was generated.
          var dropStartOnTimeLine = Math.max(
            transitionStartOnTimeline + DROP_DELAY,
            storyToDrop.previousAnimationFinish
          );

          // We should only animate the drop if there is time for the drop
          // animation to finish before the next out transition of the dropped
          // story is to start. We therefore need to check the next transition
          // of the story to be dropped (if any). Since the getNextTransition
          // requires an iteration through the story's transitions, we only
          // want to do it once, hence we cache the result in a local variable.
          const nextTransitionOfDropStory = storyToDrop.getNextTransition(
            transition
          );
          // Perform the drop if there is no next transition, or if the next
          // transition starts only after the drop transition has finished.
          if (
            !nextTransitionOfDropStory ||
            nextTransitionOfDropStory.getTransitionStartOnTimeline() >
              dropStartOnTimeLine + DROP_DURATION
          ) {
            // Animate the drop.
            // storyToDrop.token.elements
            //   .animate(DROP_DURATION, dropStartOnTimeLine, 'absolute')
            //   .y(ui.slotToYCoord(dropToSlot));
            timeline.addMove(
              storyToDrop,
              'drop',
              dropStartOnTimeLine,
              DROP_DURATION,
              fromColumn,
              fromColumn,
              storyToDrop.verticalSlot,
              dropToSlot
            );
          }
          // Record the new vertical slot on the story.
          storyToDrop.verticalSlot = dropToSlot;
          // Also record the finishing time of the drop animation, as this
          // will be needed in the case of subsequent drops of this story.
          storyToDrop.previousAnimationFinish =
            dropStartOnTimeLine + DROP_DURATION;
        });
      }

      // Keep track of how far the animation has extended so far, in order to
      // set the load bar accordingly.
      // NB in the current version of this application, the transitions should
      // get processed in an order where transitionStartOnTimeline
      // of each transition is always larger than or equal to that of the
      // previous transition, hence the use of the max function here should not
      // actually be necessary anymore. However, it's still safer to keep it
      // and the cost shouldn't be that high.
      maxEndTime = Math.max(
        maxEndTime,
        transitionStartOnTimeline + TRANSITION_DURATION
      );

      // The last transitions in the project may get pushed forward beyond our
      // original estimated animationduration; in such cases we want to extend
      // the animationDuration accordingly so that it's as long as the actual animation
      // timeline

      animationDuration = Math.max(animationDuration, maxEndTime);

      // Update the progress bar on the ui according to the progress of the
      // animation generation so far.
      const progress = maxEndTime / animationDuration;
      ui.setAnimationLoad(progress);

      if (!ui.animationPlaying) {
        // The timeline seems to start auto playing whenever new animations are
        // being added; that should be prevented, unless we actually are in a
        // playing mode already.
        timeline.pause();
      }
      // Yield control back to the calling function.
      yield;
    }
    // Now all transitions have been animated so we should execute the return
    // statement to indicate that the animation generation is complete.
    return;
  }

  /****************************************************************************
                        generateColorAnimation
   ****************************************************************************/
  /**
   * @memberof Animation
   * @inner
   * @method generateColorAnimation
   * @description Generate animation of the fill colors of the story tokens so that
   * the color of the token at any point of the animation indicates the age of
   * the story at that point in time.
   */
  function generateColorAnimation() {
    /* console.log('Starting generateColorAnimation...'); */
    // Iterate over all stories
    /* console.log(stories); */
    /* console.log(stories.getIterator()); */
    for (var story of stories.getIterator()) {
      /* console.log('Picked up story ' + story.id); */
      // The coloring should only start at the point when the story gets
      // committed, i.e. moved into a column that indicates that the story
      // has been selected to be worked on. (Ususally this is the second column,
      // and for the time being we assume that this is always the case.) The date
      // when the story was moved into the "committed column" got recorded in
      // the contructor of the story and is available through .getCommittedDate().
      // Not all stories have moved out of their initial columns, so we should
      // first check for the presence of the committed date.
      if (story.getCommittedDate()) {
        // Color animation starts at the committed date...
        const animationStartDate = story.getCommittedDate();
        // ... and ends at the "DoneDate" when the story reaches the final column,
        // or no DoneDate is available, meaning that the story hasn't reached
        // the final column yet, then the color animation should last until the
        // end of the whole project being animated.
        const animationEndDate = story.getDoneDate()
          ? story.getDoneDate()
          : transitions.getLastTransitionDate();
        // Calculate how many days (in milliseconds) after the first transition
        // the story's color animation is starting
        const animationDateSpan =
          animationStartDate - transitions.getFirstTransitionDate();
        // Convert this to animation time to get the right starting point on the
        // timeline. (NB the animationDateSpan value is used later on as well.)
        const colorAnimationStart = calendarDaysToAnimationTime(
          animationDateSpan
        );
        // Calculate the number of calendar days (in milliseconds) that the
        // story's color animation spans and convert this to animation time.
        const colorAnimationLength = calendarDaysToAnimationTime(
          animationEndDate - animationStartDate
        );
        // Define the final color value that the story should have at the
        // end of the animation. The color value is defined in terms of
        // the green and blue components in RGB since we are changing the color
        // of the stories from white to ever darkening shades of red by reducing
        // the green and blue values.
        const finalGreenAndBlueValue =
          (1 - Math.min(animationDateSpan / AGE_COLORING_MAX_AGE, 1)) * 255;
        /* console.log('finalGreenAndBlueValue: ' + finalGreenAndBlueValue); */
        // Now generate the animation of the color towards its final value
        story.token.circle
          .animate(colorAnimationLength, colorAnimationStart, 'absolute')
          .attr({
            fill: new SVG.Color({
              r: 255,
              g: finalGreenAndBlueValue,
              b: finalGreenAndBlueValue,
            }),
          });
        // Again, the timeline seems to start auto playing whenever new
        // animations are being added so the timeline should be paused again
        // unless we actually are in a playing mode already.
        // if (!ui.animationPlaying) { // no longer necessary
        //  timeline.pause();
        // }
      }
    }
  }
}
