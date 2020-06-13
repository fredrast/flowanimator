import React, { memo } from 'react';
import OpenIcon from './assets/open.svg';
import PlayIcon from './assets/play.svg';
import PauseIcon from './assets/pause.svg';
import StopIcon from './assets/stop.svg';
import InfoIcon from './assets/info.svg';
import DemoIcon from './assets/demo.svg';

function ControlPanel(props) {
  return (
    <div id="control-panel">
      <ControlButton
        id={'btnOpen'}
        type={'open'}
        icon={OpenIcon}
        tabIndex={1}
        onClick={props.handleOpenClick}
        title="Open"
        visible={true}
      />
      <ControlButton
        id={'btnPlay'}
        type={'play'}
        icon={props.playing ? PauseIcon : PlayIcon}
        tabIndex={2}
        onClick={props.handlePlayClick}
        visible={true}
        disabled={!props.playControlsEnabled}
        title="Play"
      />
      <ControlButton
        id={'btnStop'}
        type={'stop'}
        icon={StopIcon}
        tabIndex={3}
        onClick={props.handleStopClick}
        visible={true}
        disabled={!props.playControlsEnabled}
        title="Stop"
      />{' '}
      <ControlButton
        id={'btnDemo'}
        type={'demo'}
        icon={DemoIcon}
        tabIndex={3}
        onClick={props.handleDemoClick}
        visible={true}
        title="Demo"
      />
      <ControlButton
        id={'btnInfo'}
        type={'info'}
        icon={InfoIcon}
        tabIndex={3}
        onClick={() => {
          props.setShowInfo(true);
        }}
        visible={true}
        title="Info"
      />
    </div>
  );
}

function ControlButton(props) {
  if (props.visible) {
    return (
      <button
        id={props.id}
        className={'control-button'}
        tabIndex={props.tabIndex}
        onClick={props.onClick}
        disabled={props.disabled}
        title={props.title}
      >
        <img src={props.icon} className={'icon'} alt={props.type} />
      </button>
    );
  } else {
    return null;
  }
}

export default memo(ControlPanel);
