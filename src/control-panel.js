import React, { memo, useCallback, useState } from 'react';
import OpenIcon from './assets/open.svg';
import PlayIcon from './assets/play.svg';
import PauseIcon from './assets/pause.svg';
import StopIcon from './assets/stop.svg';

function ControlPanel(props) {
  return (
    <div id="control-panel">
      <ControlButton
        id={'btnOpen'}
        type={'open'}
        icon={OpenIcon}
        tabIndex={1}
        onClick={props.handleOpenClick}
        disabled={props.disabled}
      />
      <ControlButton
        id={'btnPlay'}
        type={'play'}
        icon={props.playing ? PauseIcon : PlayIcon}
        tabIndex={2}
        onClick={props.handlePlayClick}
        disabled={props.disabled}
      />
      <ControlButton
        id={'btnStop'}
        type={'stop'}
        icon={StopIcon}
        tabIndex={3}
        onClick={props.handleStopClick}
        disabled={props.disabled}
      />
    </div>
  );
}

function ControlButton(props) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      id={props.id}
      className={
        pressed ? 'control-button control-button-pressed' : 'control-button'
      }
      tabIndex={props.tabIndex}
      onClick={props.onClick}
      onMouseDown={() => {
        setPressed(true);
      }}
      onMouseUp={() => {
        setPressed(false);
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setPressed(false);
        setHover(false);
      }}
      disabled={props.disabled}
    >
      <img
        src={props.icon}
        className={hover ? 'icon-hover' : 'icon'}
        alt={props.type}
      />
    </button>
  );
}

export default memo(ControlPanel);
