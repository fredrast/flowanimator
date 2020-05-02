import React from 'react';
import OpenIcon from './assets/open.svg';
import PlayIcon from './assets/play.svg';
import StopIcon from './assets/stop.svg';

function ControlPanel(props) {
  return (
    <div id="controlPanel">
      <div align="center">
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
          icon={PlayIcon}
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
    </div>
  );
}

function ControlButton(props) {
  return (
    <button
      id={props.id}
      className="control-button"
      tabIndex={props.tabIndex}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <img src={props.icon} className="icon" alt={props.type} />
    </button>
  );
}

export default ControlPanel;
