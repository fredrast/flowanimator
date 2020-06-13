import React from 'react';
import './welcome.css';
import OpenIcon from './assets/open.svg';
import InfoIcon from './assets/info.svg';
import DemoIcon from './assets/demo.svg';

export default function Welcome(props) {
  if (props.visible) {
    return (
      <div id="welcome">
        <div id="welcome-header"> Flow Animator</div>
        <br />
        <div id="welcome-text">
          Gain a new perspective on your professional workflows in Jira (product
          development, case management, incident management, and others) by
          watching an animation of how your issues flow through the workflow
          statuses over time.
          <br />
          <br />
          Press (<img src={OpenIcon} className={'icon'} alt={'open'} />) to get
          started or (<img src={DemoIcon} className={'icon'} alt={'demo'} />)
          for a demo run with sample data, or (
          <img src={InfoIcon} className={'icon'} alt={'open'} />) for further
          information and instructions.
        </div>

        <div id="welcome-instruction" />
      </div>
    );
  } else {
    return null;
  }
}
