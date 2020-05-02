import React, { useState } from 'react';
import { AnimationData } from './animation-data.js';

function Animation(props) {
  const [projectTimespan, setProjectTimespan] = useState();
  const [animationDuration, setAnimationDuration] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  if (props.projectData) {
    console.log('run getAnimationData');
    const {
      columns,
      stories,
      transitions,
      projectTimespan_initial,
      animationDuration_initial,
    } = AnimationData.getAnimationData(props.projectData);

    setProjectTimespan(projectTimespan_initial);
    setAnimationDuration(animationDuration_initial);

    const progressCallback = loadProgress => {
      console.log('progressCallback');
      setLoadProgress(loadProgress);
      props.passPlayControlStatus(true);
    };

    const completionCallback = ({
      projectTimespan_final,
      animationDuration_final,
    }) => {
      console.log('completionCallback');
      setProjectTimespan(projectTimespan_final);
      setAnimationDuration(animationDuration_final);
    };

    AnimationData.buildAnimation(
      transitions,
      stories,
      progressCallback,
      completionCallback
    );

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
  return props.stories.map(story => <StoryToken story={story} />);
}

function StoryToken(props) {
  const { x, y, visible } = props.story.getPosition(props.animationTime);

  const styles = {
    border: 'solid',
    borderWidth: '2px',
    borderColor: '#00f',
    color: '#fff',
    width: '20px',
    height: '10px',
    borderRadius: '5px',

    visibility: visible,
    left: x,
    top: y,
  };
  return <div styles={styles} />;
}

export default Animation;
