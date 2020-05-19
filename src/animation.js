import React, { useState, useEffect, memo } from 'react';
import { AnimationData } from './animation-data.js';
import CalendarTimeline from './calendar-timeline.js';
import Slider from './slider.js';
import { useWindowDimensions } from './hooks.js';
import './animation.css';
import ColumnLabels from './column.js';
import StoryTokens from './story.js';

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
    animationTime: 0,
  });

  const setAnimationTime = animationTime => {
    setState(prevState => {
      return { ...prevState, animationTime: animationTime };
    });
  };

  /* const [columns, setColumns] = useState();
  const [stories, setStories] = useState();
  const [projectTimespan, setProjectTimespan] = useState({});
  const [animationDuration, setAnimationDuration] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [animationBuildInProgress, setAnimationBuildInProgress] = useState(
    false
  );
  const [animationTime, setAnimationTime] = useState(0); */

  // const projectData = props.projectData;

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
          transitions,
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
            transitions: transitions,
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
          transitions,
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

  const windowDimensions = useWindowDimensions();
  const margin = Math.max(
    Math.min(MARGIN_PERCENTAGE * windowDimensions.width, MAX_MARGIN),
    MIN_MARGIN
  );
  const width = windowDimensions.width - 2 * margin;

  if (props.playing) {
    const increment = 20;

    if (state.animationTime + increment > state.animationDuration) {
      props.setPlaying(false);
    } else {
      setTimeout(() => {
        setAnimationTime(state.animationTime + increment);
      }, increment);
    }
  }

  if (state.projectDataLoaded) {
    /* console.log('Rendering Animation components'); */

    return (
      <React.Fragment>
        <StoryTokens
          stories={state.stories}
          margin={margin}
          width={width}
          columnCount={
            state.columns.getCount ? state.columns.getCount() - 1 : 0
          }
          animationTime={state.animationTime}
        />
        <ColumnLabels
          columns={state.columns}
          margin={state.margin}
          width={width}
        />
        <Slider
          timespan={state.projectTimespan}
          animationDuration={state.animationDuration}
          loadProgress={state.loadProgress}
          margin={margin}
          width={width}
          animationTime={state.animationTime}
          setAnimationTime={setAnimationTime}
        />
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
