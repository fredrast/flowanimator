import React from 'react';
import './css-spinner.css';

export default function CssSpinner(props) {
  if (props.visible) {
    return (
      <div class="sk-fading-circle">
        <div class="sk-circle1 sk-circle" />
        <div class="sk-circle2 sk-circle" />
        <div class="sk-circle3 sk-circle" />
        <div class="sk-circle4 sk-circle" />
        <div class="sk-circle5 sk-circle" />
        <div class="sk-circle6 sk-circle" />
      </div>
    );
  } else {
    return <div />;
  }
}
