import React, { memo } from 'react';

const SLIDER_HEIGHT = 32;
const BAR_HEIGHT = 15;
const BAR_RADIUS = BAR_HEIGHT / 2;
const BAR_Y = 0;
const BUTTON_RADIUS = 15;

function Slider(props) {
  /* console.log('Render Slider'); */

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

  const sliderStyle = {
    // position: 'relative',
    // minHeight: SLIDER_HEIGHT,
    height: SLIDER_HEIGHT,
    marginTop: BUTTON_RADIUS / 2,
  };

  const sliderBackgroundStyle = {
    position: 'relative',
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
    position: 'relative',
    left: props.margin - BAR_RADIUS,
    top: -BAR_HEIGHT,
    zIndex: 2,
    width: foregroundWidth + 2 * BAR_RADIUS,
    height: BAR_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: BAR_RADIUS,
    cursor: 'pointer',
  };

  const sliderButtonStyle = {
    position: 'relative',
    top: -1.5 * BAR_HEIGHT - BUTTON_RADIUS,
    left: progressX - BUTTON_RADIUS,
    zIndex: 3,
    backgroundColor: '#000',
    opacity: '80%',
    height: BUTTON_RADIUS * 2,
    width: BUTTON_RADIUS * 2,
    borderRadius: BUTTON_RADIUS,
    cursor: 'grab',
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
    </div>
  );
}

export default memo(Slider);
