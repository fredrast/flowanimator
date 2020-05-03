/**
 * @file src/animation.js
 * @description Defines the {@link Animation} class that provides functionality for reading
 * workflow, issue and transition data from a source (Jira server, possibly
 * other sources in the future) and for generating the animation of the
 * issues and their transitions
 */
//
import { TransitionCollection } from './transition.js';
import { ColumnCollection, UNCREATED_COLUMN_ID } from './column.js';
import { StoryCollection } from './story.js';
import { utils } from './utils.js';

// TODO: Be consistent in whether or not unit of time (_IN_MS) is appended to variable and constant names

const TRANSITION_DURATION = 200;
const DROP_DURATION = 100;
const DROP_DELAY = 1;
const CALENDAR_DAY_IN_MS = 86400000;
const TRANSITIONS_PER_DAY = 2;
const DAY_IN_ANIMATION_TIME = TRANSITION_DURATION * TRANSITIONS_PER_DAY;
const TRANSITION_IN_CALENDAR_TIME = CALENDAR_DAY_IN_MS / TRANSITIONS_PER_DAY;
// const ATTRIBUTE_FIELDS_IN_IMPORT_FILE = 3; // The number of story attribute fields in the Jira import file before the transitions start
// const DELIMITER = ';';
// const AGE_COLORING_MAX_AGE = 180 * CALENDAR_DAY_IN_MS;

export const AnimationData = {
  getAnimationData: function({ boardConf, issues }) {
    const columns = new ColumnCollection();
    columns.addColumnsFromJira(boardConf.columnConfig.columns);
    const stories = new StoryCollection();
    stories.addStoriesFromJira(issues, columns);
    const transitions = new TransitionCollection(TRANSITION_IN_CALENDAR_TIME);
    transitions.addTransitions(stories.getTransitions());
    transitions.sort();

    const projectTimeSpan_initial = {
      startDate: transitions.getFirstTransitionDate(),
      endDate:
        transitions.getLastTransitionDate() +
        animationTimeToCalendarTime(TRANSITION_DURATION),
    };

    const animationDuration_initial =
      calendarTimeToAnimationTime(transitions.getTimespan()) +
      TRANSITION_DURATION;

    return {
      columns: columns,
      stories: stories,
      transitions: transitions,
      projectTimeSpan_initial: projectTimeSpan_initial,
      animationDuration_initial: animationDuration_initial,
    };
  },

  buildAnimation: function(
    transitions,
    stories,
    progressCallback,
    completionCallback,
    animationDuration_initial
  ) {
    // Calculate the coming duration of the animation (in milliseconds);
    // this is an estimate that may still increase if there is "congestion"
    // at the end of the animation that causes some transitions to be postponed
    // beyond the original end of the project.

    // Next, run the generation of the animation. This can take severa minutes,
    // and we don't want the ui to be frozen during that time. Therefore, we
    // will use a mechanism that yields control to the rest of the application
    // after each round in the animation generation. This is based on using
    // a) a Generator function
    // b) an async version of setInterval, as proposed by Jason Yu in comments
    // section of https://dev.to/akanksha_9560/why-not-to-use-setinterval--2na9

    // First, instantiate the generator function that generates the animation step by step
    const animationGenerator = AnimationGenerator(
      transitions,
      animationDuration_initial
    );
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
      // Progress Callback function called by setIntervalAsync upon completion of the generator
      progressCallback,
      // Completion Callback function called by setIntervalAsync upon completion of the generator
      completionCallback
    );
    // Launch the procedure to color the stories according to their age
    generateColorAnimation();
  },
};

/**
 * @memberof Animation
 * @inner
 * @method
 * @description Converts real calendar date/time values (in microseconds) to
 * their corresponding time values (in microseconds) on the animation timeline.
 * @param calendarTimeInMs The real-life date/time, expressed in Unix Epoch
 * milliseconds i.e. milliseconds since 1.1.1970
 */
const calendarTimeToAnimationTime = calendarTimeInMs => {
  return (calendarTimeInMs / CALENDAR_DAY_IN_MS) * DAY_IN_ANIMATION_TIME;
};

/**
 * @memberof Animation
 * @inner
 * @method
 * @description Converts a moment in ms on the animation timeline to the
 * corresponding real-life date/time in Unix Epoch  milliseconds
 * i.e. milliseconds since 1.1.1970
 * @param animationTimeInMs A moment in ms on the animation timeline
 */
const animationTimeToCalendarTime = animationTimeInMs => {
  return (animationTimeInMs * CALENDAR_DAY_IN_MS) / DAY_IN_ANIMATION_TIME;
};

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
function* AnimationGenerator(transitions, animationDuration_initial) {
  console.log('Starting AnimationGenerator');
  let loadProgress = 0;
  for (let transition of transitions.getIterator()) {
    // Determine where the transition should be positioned on the timeline.
    // This is based on the time stamp of the transition relative to
    // the entire timespan that the timeline represents.
    // TODO rename DateTime to Date throughout project

    // BOOKMARK: figure out why not all transitions have valid transitionStartDate field

    const transitionStartOnTimeline = calendarTimeToAnimationTime(
      transition.getTransitionStartDateTime() -
        transitions.getFirstTransitionDate()
    );

    console.log('transitionStartOnTimeline: ' + transitionStartOnTimeline);
    console.log(
      'transition.getTransitionStartDateTime(): ' +
        transition.getTransitionStartDateTime()
    );
    console.log(
      'transitions.getFirstTransitionDate(): ' +
        transitions.getFirstTransitionDate()
    );

    console.log('loadProgress: ' + loadProgress);
    console.log('transition:');
    console.log(transition);

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
    if (fromColumn.number === UNCREATED_COLUMN_ID) {
      // First, set the starting slot equal to the destination slot since we
      // want to make stories fly in horisontally in their first transition.
      fromSlot = toSlot;
    }

    // Move the token from its current column & slot to the new ones
    // storyToMove.token.elements

    storyToMove.addMove(
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
    if (fromColumn.number !== UNCREATED_COLUMN_ID) {
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
          storyToDrop.addMove(
            'drop',
            dropStartOnTimeLine,
            DROP_DURATION,
            fromColumn,
            fromColumn,
            dropFromSlot,
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

    console.log(loadProgress);
    console.log(transitionStartOnTimeline);
    console.log(TRANSITION_DURATION);

    loadProgress = Math.max(
      loadProgress,
      transitionStartOnTimeline + TRANSITION_DURATION
    );

    console.log(loadProgress);
    const animationDuration = Math.max(animationDuration_initial, loadProgress);

    const projectTimespan = {
      startDate: transitions.getFirstTransitionDate(),
      endDate:
        transitions.getFirstTransitionDate() +
        animationTimeToCalendarTime(animationDuration),
    };

    const yieldValue = {
      projectTimespan: projectTimespan,
      animationDuration: animationDuration,
      loadProgress: loadProgress,
    };

    // Yield control back to the calling function along with information
    // about how far into the animation time the animation generation
    // has proceeded.
    yield yieldValue;
  }

  // Now all transitions have been animated so we should execute the return
  // statement to indicate that the animation generation is complete, while
  // also passing information about how long the animation eventually
  // became. This may be longer than the initial estimate calculated in
  // getAnimationData if there was "congestion" at the end of the animation
  // that caused some animation(s) to be moved forward past the originally
  // estimated end time.
  console.log('Animation Generator completed');
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
  // for (var story of stories.getIterator()) {
  /* console.log('Picked up story ' + story.id); */
  // The coloring should only start at the point when the story gets
  // committed, i.e. moved into a column that indicates that the story
  // has been selected to be worked on. (Ususally this is the second column,
  // and for the time being we assume that this is always the case.) The date
  // when the story was moved into the "committed column" got recorded in
  // the contructor of the story and is available through .getCommittedDate().
  // Not all stories have moved out of their initial columns, so we should
  // first check for the presence of the committed date.
  // if (story.getCommittedDate()) {
  // // Color animation starts at the committed date...
  // const animationStartDate = story.getCommittedDate();
  // // ... and ends at the "DoneDate" when the story reaches the final column,
  // // or no DoneDate is available, meaning that the story hasn't reached
  // // the final column yet, then the color animation should last until the
  // // end of the whole project being animated.
  // const animationEndDate = story.getDoneDate()
  //   ? story.getDoneDate()
  //   : transitions.getLastTransitionDate();
  // // Calculate how many days (in milliseconds) after the first transition
  // // the story's color animation is starting
  // const animationDateSpan =
  //   animationStartDate - transitions.getFirstTransitionDate();
  // // Convert this to animation time to get the right starting point on the
  // // timeline. (NB the animationDateSpan value is used later on as well.)
  // const colorAnimationStart = calendarTimeToAnimationTime(
  //   animationDateSpan
  // );
  // // Calculate the number of calendar days (in milliseconds) that the
  // // story's color animation spans and convert this to animation time.
  // const colorAnimationLength = calendarTimeToAnimationTime(
  //   animationEndDate - animationStartDate
  // );
  // // Define the final color value that the story should have at the
  // // end of the animation. The color value is defined in terms of
  // // the green and blue components in RGB since we are changing the color
  // // of the stories from white to ever darkening shades of red by reducing
  // // the green and blue values.
  // const finalGreenAndBlueValue =
  //   (1 - Math.min(animationDateSpan / AGE_COLORING_MAX_AGE, 1)) * 255;
  // /* console.log('finalGreenAndBlueValue: ' + finalGreenAndBlueValue); */
  // // Now generate the animation of the color towards its final value
  // // story.token.circle
  // //   .animate(colorAnimationLength, colorAnimationStart, 'absolute')
  // //   .attr({
  // //     fill: new SVG.Color({
  // //       r: 255,
  // //       g: finalGreenAndBlueValue,
  // //       b: finalGreenAndBlueValue,
  // //     }),
  // //   });
  // // Again, the timeline seems to start auto playing whenever new
  // // animations are being added so the timeline should be paused again
  // // unless we actually are in a playing mode already.
  // // if (!ui.animationPlaying) { // no longer necessary
  // //  timeline.pause();
  // // }
  // }
  // }
}
