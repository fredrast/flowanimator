import React from 'react';

const SLIDER_HEIGHT = 30;
const BAR_Y = 15;
const BAR_HEIGHT = 12;
const BUTTON_Y = BAR_Y;
const BUTTON_RADIUS = 12;

export function Slider(props) {
  const foregroundWidth =
    (props.loadProgress / props.animationDuration) * props.width;

  const progress_x =
    props.margin +
    (props.animationTime / props.animationDuration) * props.width;

  const buttonDrag = event => {
    console.log('Button drag');
    console.log(event);
  };

  const barClick = event => {
    // The line caps make the line wider than its width property, thus necessary
    // to limit the possible clicked x coordinate to the interval (0,width)
    const clickedProgressX = Math.max(
      // not less than 0
      Math.min(
        // not more than width
        event.clientX - props.margin,
        props.width
      ),
      0
    );
    const clickedAnimationTime =
      (clickedProgressX / props.width) * props.animationDuration;
    props.setAnimationTime(clickedAnimationTime);
  };

  const sliderBackgroundStyle = {
    stroke: '#fff',
    opacity: '50%',
    strokeWidth: BAR_HEIGHT + 'px',
    strokeLinecap: 'round',
  };

  const sliderForegroundStyle = {
    stroke: '#fff',
    opacity: '100%',
    strokeWidth: BAR_HEIGHT + 'px',
    strokeLinecap: 'round',
  };

  const buttonForegroundStyle = {
    fill: '#000',
    opacity: '80%',
  };

  return (
    <div id="slider">
      <svg width={props.width + 2 * props.margin} height={SLIDER_HEIGHT}>
        <line
          x1={props.margin}
          y1={BAR_Y}
          x2={props.margin + props.width}
          y2={BAR_Y}
          style={sliderBackgroundStyle}
        />
        <line
          x1={props.margin}
          y1={BAR_Y}
          x2={props.margin + foregroundWidth}
          y2={BAR_Y}
          style={sliderForegroundStyle}
          onMouseDown={barClick}
        />
        <circle
          cx={progress_x}
          cy={BUTTON_Y}
          r={BUTTON_RADIUS}
          style={buttonForegroundStyle}
          draggable={true}
          onDrag={buttonDrag}
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
