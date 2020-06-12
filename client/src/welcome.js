import React from 'react';
import './welcome.css';

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
        </div>
      </div>
    );
  } else {
    return null;
  }
}
