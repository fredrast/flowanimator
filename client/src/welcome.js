import React from 'react';
import { animated, config, useTransition } from 'react-spring';
import './welcome.css';
import OpenIcon from './assets/open.svg';
import InfoIcon from './assets/info.svg';
import DemoIcon from './assets/demo.svg';

export default function Welcome(props) {
  const fadeInOut = useTransition(props.visible, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    delay: 500,
    config: { duration: 800 },
  });

  return fadeInOut.map(({ item, key, props: fadeInOutAnimation }) => {
    return (
      item && (
        <animated.div style={fadeInOutAnimation} id="welcome">
          <div id="welcome-header"> Flow Animator</div>
          <br />
          <div id="welcome-text">
            Gain a new perspective on your professional workflows in Jira
            (product development, service desk, incident management management,
            or whatever you may be using Jira for) by watching an animation of
            your issues flowing through the workflow statuses over time.
          </div>
        </animated.div>
      )
    );
  });
}
