import React, { useState, useEffect } from 'react';
import { AnimationData } from './animation-data.js';
import { CalendarTimeline } from './calendarTimeline.js';
import { useWindowDimensions } from './hooks.js';
import './animation.css';

const MARGIN_PERCENTAGE = 0.1;
const MAX_MARGIN = 40;

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

  const projectData = props.projectData;

  useEffect(() => {
    console.log('Starting useEffect with following projectData:');
    console.log(projectData);
    console.log('animationBuildInProgress:');
    console.log(animationBuildInProgress);
    if (projectData) {
      if (!animationBuildInProgress) {
        setAnimationBuildInProgress(true);
        /* console.log('Launching getAnimationData...'); */
        const {
          columns,
          stories,
          transitions,
          projectTimespan_initial,
          animationDuration_initial,
        } = AnimationData.getAnimationData(projectData);

        console.log('Animation:');
        console.log('projectTimespan_initial is');
        console.log(projectTimespan_initial);

        setColumns(columns);
        setStories(stories);
        setProjectTimespan(projectTimespan_initial);
        setAnimationDuration(animationDuration_initial);

        console.log('projectTimespan set to');
        console.log(projectTimespan);

        const progressCallback = ({
          projectTimespan_updated,
          animationDuration,
          loadProgress,
        }) => {
          console.log(
            'Starting progressCallback with load progress ' + loadProgress
          );
          console.log('and projectTimespan');
          console.log(projectTimespan_updated);
          console.log(projectTimespan);
          setProjectTimespan(projectTimespan_updated);
          setAnimationDuration(animationDuration);
          setLoadProgress(loadProgress);
          // handleAnimationBuildStarted();
        };

        const completionCallback = () => {
          /* console.log('Starting completionCallback...'); */
          setAnimationBuildInProgress(false);
          /* console.log('...completionCallback completed'); */
        };

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
  const margin = Math.min(
    MARGIN_PERCENTAGE * windowDimensions.width,
    MAX_MARGIN
  );
  const width = windowDimensions.width - 2 * margin;
  console.log('width: ' + width);

  if (stories) {
    // TODO more elegant way to determine whether the data for these components is ready to be rendered
    console.log('Animation, before return:');
    console.log(projectTimespan);
    return (
      <div id="animation-board">
        <StoryTokens stories={stories} />
        <ColumnLabels columns={columns} magin={margin} width={width} />
        <CalendarTimeline
          timespan={projectTimespan}
          margin={margin}
          width={width}
        />
        <Slider
          timespan={projectTimespan}
          animationDuration={animationDuration}
          loadProgress={loadProgress}
          magin={margin}
          width={width}
        />
      </div>
    );
  } else {
    return <div id="animation-board" />;
  }
}

function Slider(props) {
  return <div id="slider" />;
}

function ColumnLabels(props) {
  return <div id="column-labels" />;
}

function StoryTokens(props) {
  return (
    <div id="story-tokens">
      <br />
      {props.stories.asArray().map(story => (
        <StoryToken class="story-token" story={story} key={story.id} />
      ))}
    </div>
  );
}

function StoryToken(props) {
  // const { x, y, visible } = props.story.getPosition(props.animationTime);

  const styles = {
    border: 'solid',
    borderWidth: '2px',
    borderColor: '#00f',
    color: '#fff',
    width: '20px',
    height: '10px',
    borderRadius: '5px',

    visibility: 'visible',
    left: 100,
    top: 100,
  };
  return <div styles={styles} key={props.story.id} />;
}

export default Animation;
