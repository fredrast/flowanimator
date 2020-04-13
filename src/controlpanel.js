import React from "react";
import { render } from "react-dom";

function ControlPanel(props) {
  console.log("Create Control Panel...");
  console.log(props);
  console.log("");
  return (
    <div id="controlPanel">
      <ControlButton
        id={"btnOpen"}
        type={"open"}
        tabIndex={1}
        onClick={props.handleOpenClick}
      />
      <ControlButton
        id={"btnPlay"}
        type={"play"}
        tabIndex={2}
        onClick={props.handlePlayClick}
      />
      <ControlButton
        id={"btnStop"}
        type={"stop"}
        tabIndex={3}
        onClick={props.handleStopClick}
      />
    </div>
  );
}

function ControlButton(props) {
  console.log("Create button");
  console.log(props);
  console.log("");
  return (
    <button
      id={props.id}
      className="control-button"
      tabIndex={props.tabIndex}
      onClick={props.onClick}
    ></button>
  );
}

export default ControlPanel;
