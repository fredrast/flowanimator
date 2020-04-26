import React, { useState } from 'react';
import { AnimationData } from './animation-data.js';

function Animation(props) {
  if (props.jiraData) {
    const aD = new AnimationData().getAnimationData(props.jiraData);

    return (
      <div id="animation-board">
        <Timeline startDate={aD.startDate} endDate={aD.endDate} />
        <Slider
          timeSpan={aD.timeSpan}
          animationDuration={aD.animationDuration}
        />
        <Stories stories={aD.stories} />
      </div>
    );
  } else {
    return <div id="animation-board" />;
  }
}

function Stories(props) {
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

function Slider(props) {
  return <div />;
}

function Timeline(props) {
  return <div />;
}

export default Animation;
