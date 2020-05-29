import React, { useState, useEffect, useRef, memo } from 'react';
import { AnimationData } from './animation-data.js';
import CalendarTimeline from './calendar-timeline.js';
import Slider from './slider.js';
import { useWindowDimensions } from './hooks.js';
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

  const clickNewAnimationTime = animationTime => {
    /* console.log(''); */
    /* console.log(''); */
    /* console.log('clickNewAnimationTime'); */
    /* console.log(''); */

    setAnimationTime(animationTime);
    /* console.log('animationTime updated to ' + animationTime); */
  };

  useEffect(() => {
    setTimer(
      new Timer(
        setAnimationTime,
        state.loadProgress,
        props.handleAnimationFinished
      )
    );
  }, [state.loadProgress]);

  useEffect(() => {
    /* console.log('Starting useEffect with following projectData:'); */
    /* console.log(props.projectData); */
    /* console.log('animationBuildInProgress:'); */
    /* console.log(animationBuildInProgress); */

    if (props.projectData) {
      /* console.log('Project data found, continuing'); */
      if (!state.animationBuildInProgress) {
        setState(prevState => {
          return { ...state, animationBuildInProgress: true };
        });
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

  useEffect(() => {
    console.log('useEffect to start/stop timer');
    console.log(props.playing);
    console.log(timer);
    if (timer) {
      if (props.playing) {
        console.log('Start the timer');
        timer.play();
      } else {
        console.log('Stop the timer');
        timer.pause();
      }
    }
  }, [props.playing]);

  const windowDimensions = useWindowDimensions();
  const margin = Math.max(
    Math.min(MARGIN_PERCENTAGE * windowDimensions.width, MAX_MARGIN),
    MIN_MARGIN
  );
  const width = windowDimensions.width - 2 * margin;

  if (state.projectDataLoaded) {
    /* console.log('Rendering Animation components'); */
    /* console.log('Stories:'); */
    /* console.log(state.stories); */

    return (
      <React.Fragment>
        <StoryTokens
          stories={state.stories}
          margin={margin}
          width={width}
          columnCount={
            state.columns.getCount ? state.columns.getCount() - 1 : 0
          }
          animationTime={animationTime}
        />
        <ColumnLabels columns={state.columns} margin={margin} width={width} />
        <Slider
          timespan={state.projectTimespan}
          animationDuration={state.animationDuration}
          loadProgress={state.loadProgress}
          margin={margin}
          width={width}
          animationTime={animationTime}
          setAnimationTime={clickNewAnimationTime}
        />
        <div>{state.animationTime}</div>
        {/*  <div>width: {windowDimensions.width}</div>
        <div>
          mouse coords: {mouseCoords.x},{mouseCoords.y}
        </div>
        <div>animation time: {animationTime}</div>
        <div>animation duration: {animationDuration}</div> */}
        <CalendarTimeline
          timespan={state.projectTimespan}
          margin={margin}
          width={width}
        />
      </React.Fragment>
    );
  } else {
    return <div id="animation-board" />;
  }
}

export default memo(Animation);
