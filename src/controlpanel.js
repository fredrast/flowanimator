import React from 'react';
import { render } from 'react-dom';
import OpenIcon from './assets/open.svg';
import PlayIcon from './assets/play.svg';
import StopIcon from './assets/stop.svg';

function ControlPanel(props) {
  console.log('Create Control Panel...');
  console.log(props);
  console.log('');
  return (
    <div id="controlPanel">
      <div align="center">
        <ControlButton
          id={'btnOpen'}
          type={'open'}
          icon={OpenIcon}
          tabIndex={1}
          onClick={props.handleOpenClick}
        />
        <ControlButton
          id={'btnPlay'}
          type={'play'}
          icon={PlayIcon}
          tabIndex={2}
          onClick={props.handlePlayClick}
        />
        <ControlButton
          id={'btnStop'}
          type={'stop'}
          icon={StopIcon}
          tabIndex={3}
          onClick={props.handleStopClick}
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
    >
      <img src={props.icon} className="icon" />
    </button>
  );
}

export default ControlPanel;
