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
  console.log('Render Animation');

  const [columns, setColumns] = useState();
  const [stories, setStories] = useState();
  const [projectTimespan, setProjectTimespan] = useState({});
  const [animationDuration, setAnimationDuration] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [animationBuildInProgress, setAnimationBuildInProgress] = useState(
    false
  );
  const [animationTime, setAnimationTime] = useState(0);

  const projectData = props.projectData;

  useEffect(() => {
    /* console.log('Starting useEffect with following projectData:'); */
    /* console.log(projectData); */
    /* console.log('animationBuildInProgress:'); */
    /* console.log(animationBuildInProgress); */
    if (projectData) {
      if (!animationBuildInProgress) {
        setAnimationBuildInProgress(true);
        console.log('Launching getAnimationData...');
        const {
          columns,
          stories,
          transitions,
          projectTimespan_initial,
          animationDuration_initial,
        } = AnimationData.getAnimationData(projectData);
        console.log('getAnimationData completed, updating state');
        /* console.log('Animation:'); */
        /* console.log('projectTimespan_initial is'); */
        /* console.log(projectTimespan_initial); */

        console.log('columns');
        setColumns(columns);
        console.log('stories');
        setStories(stories);
        console.log('projectTimespan');
        setProjectTimespan(projectTimespan_initial);
        console.log('animationDuration');
        setAnimationDuration(animationDuration_initial);
        /* console.log('projectTimespan set to'); */
        /* console.log(projectTimespan); */

        const progressCallback = ({
          projectTimespan_updated,
          animationDuration,
          loadProgress,
        }) => {
          console.log(
            'Starting progressCallback with load progress ' + loadProgress
          );
          /* console.log('and projectTimespan'); */
          /* console.log(projectTimespan_updated); */
          console.log('updating projectTimespan');
          setProjectTimespan(projectTimespan_updated);
          console.log('updating animationDuration');
          setAnimationDuration(animationDuration);
          console.log('updating loadProgress');
          setLoadProgress(loadProgress);
          // handleAnimationBuildStarted();
        };

        const completionCallback = () => {
          /* console.log('Starting completionCallback...'); */
          setAnimationBuildInProgress(false);
          /* console.log('...completionCallback completed'); */
          console.log('buildAnimation completed');
        };

        console.log('Launching buildAnimation');
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
  }, [projectData]);

  const windowDimensions = useWindowDimensions();
  const margin = Math.max(
    Math.min(MARGIN_PERCENTAGE * windowDimensions.width, MAX_MARGIN),
    MIN_MARGIN
  );
  const width = windowDimensions.width - 2 * margin;

  if (stories) {
    // TODO more elegant way to determine whether the data for these components is ready to be rendered
    /* console.log('Animation, before return:'); */
    /* console.log(projectTimespan); */

    console.log('Rendering Animation components');

    return (
      <React.Fragment>
        <StoryTokens
          stories={stories}
          margin={margin}
          width={width}
          columnCount={columns.getCount()}
          animationTime={animationTime}
        />
        <ColumnLabels columns={columns} margin={margin} width={width} />
        <Slider
          timespan={projectTimespan}
          animationDuration={animationDuration}
          loadProgress={loadProgress}
          margin={margin}
          width={width}
          animationTime={animationTime}
          setAnimationTime={setAnimationTime}
        />
        {/*  <div>width: {windowDimensions.width}</div>
        <div>
          mouse coords: {mouseCoords.x},{mouseCoords.y}
        </div>
        <div>animation time: {animationTime}</div>
        <div>animation duration: {animationDuration}</div> */}
        <CalendarTimeline
          timespan={projectTimespan}
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
