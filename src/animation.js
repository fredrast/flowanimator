import React, { useState, useEffect, memo } from 'react';
import { AnimationData } from './animation-data.js';
import CalendarTimeline from './calendar-timeline.js';
import Slider from './slider.js';
// import { useWindowDimensions } from './hooks.js';
import './animation.css';
import ColumnLabels from './column.js';
import StoryTokens from './story.js';
import Timer from './timer.js';

const MARGIN_PERCENTAGE = 0.12;
const MIN_MARGIN = 50;
const MAX_MARGIN = 50;

function Animation(props) {
  /* console.log('Render Animation'); */

  const [state, setState] = useState({
    projectDataLoaded: false,
    columns: {},
    stories: {},
    projectTimespan: 0,
    animationDuration: 0,
    loadProgress: 0,
    animationBuildInProgress: false,
  });

  const [animationTime, setAnimationTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const clickNewAnimationTime = animationTime => {
    const MINIMMUM_ANIMATION_TIME_CHANGE = 80;
    setAnimationTime(previousAnimationTime => {
      // Only update animation time if the new animation time clicked by
      // the user differs sufficiently from the previously set one; this is
      // to avoid too frequent updating of token positions while dragging
      // the slider button
      if (
        Math.abs(animationTime - previousAnimationTime) >=
        MINIMMUM_ANIMATION_TIME_CHANGE
      ) {
        return animationTime;
      } else {
        return previousAnimationTime;
      }
    });
  };

  /*** Hook for recreating the timer with new load progress as the animation build proceeds  ***/
  useEffect(() => {
    setTimer(
      new Timer(
        setAnimationTime,
        state.loadProgress,
        props.handleAnimationFinished
      )
    );
  }, [state.loadProgress, props.handleAnimationFinished]);

  /*** Hook for building animation when new project data received ***/
  useEffect(() => {
    if (props.projectData) {
      // Use state variable animationBuildInProgress to avoid (accidentally)
      // starting a new animation build round while the previous is running.
      if (!state.animationBuildInProgress) {
        console.log('Start animation build, set animation time to 0');
        setState(prevState => {
          return {
            ...prevState,
            animationBuildInProgress: true,
          };
        });
        // R  eset animation time to 0.
        setAnimationTime(0);
        /* console.log('Launching getAnimationData...'); */
        const {
          columns,
          stories,
          projectTimespan_initial,
          animationDuration_initial,
        } = AnimationData.getAnimationData(props.projectData);
        /* console.log('getAnimationData completed, updating state'); */
        /* console.log('Animation:'); */
        /* console.log('projectTimespan_initial is'); */
        /* console.log(projectTimespan_initial); */
        /* console.log('Update state after getAnimationData'); */
        setState(prevState => {
          return {
            ...prevState,
            projectDataLoaded: true,
            columns: columns,
            stories: stories,
            projectTimespan: projectTimespan_initial,
            animationDuration: animationDuration_initial,
          };
        });

        const progressCallback = ({
          projectTimespan_updated,
          animationDuration,
          loadProgress,
        }) => {
          /* console.log(
            'Starting progressCallback with load progress ' + loadProgress
          ); */

          setState(prevState => {
            return {
              ...prevState,
              projectTimespan: projectTimespan_updated,
              animationDuration: animationDuration,
              loadProgress: loadProgress,
            };
          });

          // handleAnimationBuildStarted();
        };

        const completionCallback = () => {
          /* console.log('Starting completionCallback...'); */

          setState(prevState => {
            return {
              ...prevState,
              animationBuildInProgress: false,
            };
          });
          /* console.log('...completionCallback completed'); */
          /* console.log('buildAnimation completed'); */
        };
        /* console.log('Launching buildAnimation'); */
        AnimationData.buildAnimation(
          stories,
          progressCallback,
          completionCallback,
          animationDuration_initial
        );
      } else {
        /* console.log('Animation Build already in progress, doing nothing'); */
      }
    } else {
      /* console.log('No project data, doing nothing'); */
    }
  }, [props.projectData]);

  /*** Hook for starting and stopping the timer as the play/pause status is toggled ***/
  useEffect(() => {
    if (timer) {
      if (props.playing) {
        console.log('Start the timer');
        timer.play();
      } else {
        console.log('Stop the timer');
        timer.pause();
      }
    }
  }, [props.playing, timer]);

  /*** Hook for resetting width of display when browser window is resized ***/
  function getWindowDimensions() {
    const windowWidth = window.innerWidth;
    const margin = Math.max(
      Math.min(MARGIN_PERCENTAGE * windowWidth, MAX_MARGIN),
      MIN_MARGIN
    );
    const contentWidth = windowWidth - 2 * margin;
    return {
      windowWidth,
      contentWidth,
      margin,
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (state.projectDataLoaded) {
    return (
      <React.Fragment>
        <StoryTokens
          stories={state.stories}
          margin={windowDimensions.margin}
          width={windowDimensions.contentWidth}
          columnCount={
            state.columns.getCount ? state.columns.getCount() - 1 : 0
          }
          animationTime={animationTime}
        />
        <ColumnLabels
          columns={state.columns}
          margin={windowDimensions.margin}
          width={windowDimensions.contentWidth}
        />
        <Slider
          timespan={state.projectTimespan}
          animationDuration={state.animationDuration}
          loadProgress={state.loadProgress}
          margin={windowDimensions.margin}
          width={windowDimensions.contentWidth}
          animationTime={animationTime}
          setAnimationTime={clickNewAnimationTime}
        />
        <div>{animationTime}</div>
        <CalendarTimeline
          timespan={state.projectTimespan}
          margin={windowDimensions.margin}
          width={windowDimensions.contentWidth}
        />
      </React.Fragment>
    );
  } else {
    return <div id="animation-board" />;
  }
}

export default memo(Animation);
