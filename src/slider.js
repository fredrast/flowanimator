import React from 'react';

const SLIDER_HEIGHT = 30;
const BAR_Y = 10;
const BAR_HEIGHT = 10;
const BUTTON_Y = BAR_Y + BAR_HEIGHT / 2;
const BUTTON_RADIUS = 14;

export function Slider(props) {
  const foregroundWidth =
    (props.loadProgress / props.animationDuration) * props.width;

  const progress_x =
    (props.animationTime / props.animationDuration) * props.width;

  const buttonDrag = event => {
    console.log('Button drag');
    console.log(event);
  };

  const marginStyle = {
    'margin-left': props.margin,
    'margin-right': props.margin,
  };

  const sliderBackgroundStyle = {
    fill: '#fff',
    opacity: '50%',
  };

  const sliderForegroundStyle = {
    fill: '#fff',
    opacity: '100%',
  };

  const buttonForegroundStyle = {
    fill: '#fff',
    opacity: '80%',
  };

  return (
    <div id="slider" style={marginStyle}>
      <svg width={props.width} height={SLIDER_HEIGHT}>
        <rect
          x={0}
          y={BAR_Y}
          rx={BAR_HEIGHT / 2}
          width={props.width}
          height={BAR_HEIGHT}
          style={sliderBackgroundStyle}
        />
        <rect
          x={0}
          y={BAR_Y}
          rx={BAR_HEIGHT / 2}
          width={foregroundWidth}
          height={BAR_HEIGHT}
          style={sliderForegroundStyle}
        />
        <circle
          cx={progress_x}
          cy={BUTTON_Y}
          r={BUTTON_RADIUS}
          style={buttonForegroundStyle}
          draggable="true"
          ondrag={buttonDrag}
        />
      </svg>
    </div>
  );
}

/*
timespan={projectTimespan}
animationDuration={animationDuration}
loadProgress={loadProgress}
magin={margin}
width={width}

*/
