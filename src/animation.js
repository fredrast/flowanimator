import React, { useState, useEffect } from 'react';
import { AnimationData } from './animation-data.js';

function Animation(props) {
  const [columns, setColumns] = useState();
  const [stories, setStories] = useState();
  const [projectTimespan, setProjectTimespan] = useState();
  const [animationDuration, setAnimationDuration] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [animationBuildInProgress, setAnimationBuildInProgress] = useState(
    false
  );

  const projectData = props.projectData;
  // const handleAnimationBuildStarted = props.handleAnimationBuildStarted;
  /* console.log('Render Animation'); */

  useEffect(() => {
    /* console.log('Starting useEffect with following projectData:'); */
    /* console.log(projectData); */
    /* console.log('animationBuildInProgress:'); */
    /* console.log(animationBuildInProgress); */
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

        // console.log('Got the following transitions:');
        // console.log(transitions);

        setColumns(columns);
        /* console.log('setStories:'); */
        /* console.log(stories); */
        setStories(stories);
        setProjectTimespan(projectTimespan_initial);
        setAnimationDuration(animationDuration_initial);

        const progressCallback = ({
          progressTimespan,
          animationDuration,
          loadProgress,
        }) => {
          /* console.log(
            'Starting progressCallback with load progress ' + loadProgress
          ); */
          setProjectTimespan(progressTimespan);
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

  if (stories) {
    // TODO more elegant way to determine whether the data for these components is ready to be rendered

    return (
      <div id="animation-board">
        <Timeline timespan={projectTimespan} />
        <Slider
          timespan={projectTimespan}
          animationDuration={animationDuration}
          loadProgress={loadProgress}
        />
        <ColumnLabels columns={columns} />
        <StoryTokens stories={stories} />
      </div>
    );
  } else {
    return <div id="animation-board" />;
  }
}

function Timeline(props) {
  return <div />;
}

function Slider(props) {
  return <div />;
}

function ColumnLabels(props) {
  return <div />;
}

function StoryTokens(props) {
  return props.stories
    .asArray()
    .map(story => <StoryToken story={story} key={story.id} />);
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
