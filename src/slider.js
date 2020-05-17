import React from 'react';

const SLIDER_HEIGHT = 32;
const BAR_HEIGHT = 15;
const BAR_RADIUS = BAR_HEIGHT / 2;
const BAR_Y = 0;
const BUTTON_RADIUS = 1 * BAR_HEIGHT;
const BUTTON_Y = BAR_Y + BAR_HEIGHT / 2 - BUTTON_RADIUS;

export function Slider(props) {
  const foregroundWidth =
    (props.loadProgress / props.animationDuration) * props.width;

  const progressX =
    props.margin +
    (props.animationTime / props.animationDuration) * props.width;

  const handleStartDrag = event => {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = event => {
    const draggedAnimationTime = clientXToAnimationTime(event.clientX);
    props.setAnimationTime(draggedAnimationTime);
  };

  const handleDragEnd = event => {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const handleBarClick = event => {
    const clickedAnimationTime = clientXToAnimationTime(event.clientX);
    props.setAnimationTime(clickedAnimationTime);
  };

  const clientXToAnimationTime = clientX => {
    // The line caps make the line wider than its width property, thus necessary
    // to limit the possible clicked x coordinate to the interval (0,width)
    const newProgressX = Math.max(
      // not less than 0
      Math.min(
        // not more than width
        clientX - props.margin,
        (props.loadProgress / props.animationDuration) * props.width
      ),
      0
    );
    const animationTime =
      (newProgressX / props.width) * props.animationDuration;
    return animationTime;
  };

  /*  const sliderBackgroundStyle = {
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
  };*/

  const handleButtonDrag = event => {
    /*event.preventDefault();
    if (event.clientX > 0) {
      // TODO: figure out why this is necessary
      const draggedAnimationTime = clientXToAnimationTime(event.clientX);
      props.setAnimationTime(draggedAnimationTime);
    }
    console.log('handleButtonDrag');
    const event_copy = { ...event };
    console.log(event_copy);*/
  };

  const sliderStyle = {
    position: 'relative',
    minHeight: SLIDER_HEIGHT,
  };

  const sliderBackgroundStyle = {
    position: 'absolute',
    left: props.margin - BAR_RADIUS,
    top: BAR_Y,
    zIndex: 1,
    width: props.width + 2 * BAR_RADIUS,
    height: BAR_HEIGHT,
    backgroundColor: '#fff',
    opacity: '50%',
    borderRadius: BAR_RADIUS,
  };

  const sliderForegroundStyle = {
    position: 'absolute',
    left: props.margin - BAR_RADIUS,
    top: BAR_Y,
    zIndex: 2,
    width: foregroundWidth + 2 * BAR_RADIUS,
    height: BAR_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: BAR_RADIUS,
  };

  const sliderButtonStyle = {
    position: 'absolute',
    top: BUTTON_Y + 'px',
    left: progressX - BUTTON_RADIUS,
    zIndex: 3,
    backgroundColor: '#000',
    opacity: '80%',
    height: BUTTON_RADIUS * 2,
    width: BUTTON_RADIUS * 2,
    borderRadius: BUTTON_RADIUS,
  };

  return (
    <div id="slider" style={sliderStyle}>
      <div id="sliderBackground" style={sliderBackgroundStyle} />
      <div
        id="sliderForeground"
        style={sliderForegroundStyle}
        onMouseDown={handleBarClick}
      />
      <div
        id="sliderButton"
        style={sliderButtonStyle}
        onMouseDown={handleStartDrag}
      />
      {/*  draggable={true}
        onDrag={handleButtonDrag}
        onDragEnd={handleButtonDrag}*/}
      {/*<svg width={props.width + 2 * props.margin} height={SLIDER_HEIGHT}>
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
          ref={buttonRef}
          draggable
          onDragStart={event => console.log('onDragStart')}
        />
      </svg>

      <div draggable onDragStart={event => console.log('onDragStart')}>
        Dragging: {dragging.toString()}
      </div>
      <br />*/}
    </div>
  );
}
