import React, { memo } from 'react';
import './data-area.css';

function DataArea(props) {
  const dataAreaStyle = {
    marginLeft: props.margin,
    marginRight: props.margin,
    flex: 0,
    minHeight: '80px',
    padding: '0px',
  };

  return (
    <div id="data-area" style={dataAreaStyle}>
      <AnimationTimeDisplay
        animationTime={props.animationTime}
        animationTimeToCalendarDate={
          props.animationData.animationTimeToCalendarDate
        }
      />
      <div id="control-buttons-placeholder" />
      <SelectedStoryDetails selectedStory={props.selectedStory} />
    </div>
  );
}

function AnimationTimeDisplay(props) {
  const animationTime = new Date(props.animationTime)
    .toISOString()
    .slice(11, 19);
  //https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
  const animatedDate = new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(props.animationTimeToCalendarDate(props.animationTime)));

  return (
    <div id="animation-time-display" className="data-box">
      {animationTime} <br />
      {animatedDate}
    </div>
  );
}

function SelectedStoryDetails(props) {
  if (props.selectedStory) {
    return (
      <div className="data-box">
        <div id="selected-story-details">
          {props.selectedStory.id} {props.selectedStory.name}
          <br />
          Created: {props.selectedStory.created}
          <br />
          Creator: {props.selectedStory.creator}
        </div>
      </div>
    );
  } else {
    return <div className="data-box" />;
  }
}

/*

  if (props.selectedStory) {
    return (
      <div id="selected-story-details" style={selectedStoryDetailsStyle}>
        {props.selectedStory.id} <br />
        {props.selectedStory.name}
      </div>
    );
  } else {
    return <div />;
  }
}
*/

export default memo(DataArea);
