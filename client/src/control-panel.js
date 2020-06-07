import React, { memo } from 'react';
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
      />
      <ControlButton
        id={'btnPlay'}
        type={'play'}
        icon={props.playing ? PauseIcon : PlayIcon}
        tabIndex={2}
        onClick={props.handlePlayClick}
        disabled={!props.playControlsEnabled}
      />
      <ControlButton
        id={'btnStop'}
        type={'stop'}
        icon={StopIcon}
        tabIndex={3}
        onClick={props.handleStopClick}
        disabled={!props.playControlsEnabled}
      />
    </div>
  );
}

function ControlButton(props) {
  return (
    <button
      id={props.id}
      className={'control-button'}
      tabIndex={props.tabIndex}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <img src={props.icon} className={'icon'} alt={props.type} />
    </button>
  );
}

export default memo(ControlPanel);
