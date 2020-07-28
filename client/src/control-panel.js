import React, { memo, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import OpenIcon from './assets/open.svg';
import PlayIcon from './assets/play.svg';
import PauseIcon from './assets/pause.svg';
import StopIcon from './assets/stop.svg';
import DemoIcon from './assets/demo.svg';
import InfoIcon from './assets/info.svg';

import HelptextOpen from './assets/helptext-open.svg';
import HelptextDemo from './assets/helptext-demo.svg';
import HelptextInfo from './assets/helptext-info.svg';

function ControlPanel(props) {
  const [helptextsVisible, setHelptextsVisible] = useState(true);

  const handleOpenClick = () => {
    setHelptextsVisible(false);
    props.handleOpenClick();
  };

  const handleDemoClick = () => {
    setHelptextsVisible(false);
    props.handleDemoClick();
  };

  const handleInfoClick = () => {
    setHelptextsVisible(false);
    props.setShowInfo(true);
  };

  return (
    <div id="control-panel">
      <ControlButton
        id={'button-open'}
        type={'open'}
        icon={OpenIcon}
        tabIndex={1}
        onClick={handleOpenClick}
        title="Open"
        visible={true}
        helptextImage={HelptextOpen}
        helptext="Click here to get started"
        showHelptext={helptextsVisible}
        helptextNumber="1"
      />
      <ControlButton
        id={'button-play'}
        type={'play'}
        icon={props.playing ? PauseIcon : PlayIcon}
        tabIndex={2}
        onClick={props.handlePlayClick}
        visible={true}
        disabled={!props.playControlsEnabled}
        title="Play"
      />
      <ControlButton
        id={'button-stop'}
        type={'stop'}
        icon={StopIcon}
        tabIndex={3}
        onClick={props.handleStopClick}
        visible={true}
        disabled={!props.playControlsEnabled}
        title="Stop"
      />
      <ControlButton
        id={'button-demo'}
        type={'demo'}
        icon={DemoIcon}
        tabIndex={4}
        onClick={handleDemoClick}
        visible={true}
        title="Demo"
        helptextImage={HelptextDemo}
        helptext="Click here for a demo with sample data "
        showHelptext={helptextsVisible}
        helptextNumber="2"
      />
      <ControlButton
        id={'button-info'}
        type={'info'}
        icon={InfoIcon}
        tabIndex={5}
        onClick={handleInfoClick}
        visible={true}
        title="Info"
        helptextImage={HelptextInfo}
        helptext="Click here for further information"
        showHelptext={helptextsVisible}
        helptextNumber="3"
      />{' '}
    </div>
  );
}

function ControlButton(props) {
  if (props.visible) {
    return (
      <div className="button-wrapper">
        <Helptext
          id={props.id + '-helptext'}
          number={props.helptextNumber}
          visible={props.showHelptext}
          image={props.helptextImage}
          text={props.helptext}
        />
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
      </div>
    );
  } else {
    return null;
  }
}

function Helptext(props) {
  const [appearing, setAppearing] = useState(false);

  const animation = useSpring({
    config: { mass: 2, tension: 100, friction: 20, velocity: 10 },
    opacity: appearing ? 1 : 0,
    top: -125,
    from: { top: 100, opacity: 0 },
    delay: 200 + props.number * 1000,
    onStart: () => {
      setAppearing(true);
    },
  });

  if (props.visible) {
    return (
      <animated.img
        src={props.image}
        id={props.id}
        className={'helptext'}
        style={animation}
      />
    );
  } else {
    return null;
  }
}

export default memo(ControlPanel);
