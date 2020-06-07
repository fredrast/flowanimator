import React from 'react';
import './css-spinner.css';

// Based on https://tobiasahlin.com/spinkit/

export default function CssSpinner(props) {
  if (props.visible) {
    return (
      <div className="sk-fading-circle">
        <div className="sk-circle1 sk-circle" />
        <div className="sk-circle2 sk-circle" />
        <div className="sk-circle3 sk-circle" />
        <div className="sk-circle4 sk-circle" />
        <div className="sk-circle5 sk-circle" />
        <div className="sk-circle6 sk-circle" />
      </div>
    );
  } else {
    return <div />;
  }
}
