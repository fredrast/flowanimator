import React, { useState } from "react";
import "./App.css";
import Modal from "./modal.js";
import "./modal.css";
import ControlPanel from "./controlpanel.js";
import "./controlpanel.css";
import Animation from "./animation.js";
import "./animation.css";

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState();
  const [playing, setPlaying] = useState(false);
  const [playControlsEnabled, setPlayControlsEnabled] = useState(false);

  const handleOpenClick = () => {
    setModalVisible(true);
  };
  const handlePlayClick = () => {
    setPlaying(!playing);
  };
  const handleStopClick = () => {
    setPlaying(false);
    // TODO how to return the animation to beginning?
  };
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const passProjectData = projectData => {
    setProjectData(projectData);
  };

  const handleAnimationBuildStarted = () => {
    setPlayControlsEnabled(true);
  };

  const handleAnimationFinished = () => {
    setPlaying(false);
  };

  return (
    <div className="App">
      <Animation
        projectData={projectData}
        playing={playing}
        handleAnimationBuildStarted={handleAnimationBuildStarted}
        animationFinishedCallback={handleAnimationFinished}
      />

      <ControlPanel
        playControlsEnabled={playControlsEnabled}
        playing={playing}
        handleOpenClick={handleOpenClick}
        handlePlayClick={handlePlayClick}
        handleStopClick={handleStopClick}
        disabled={modalVisible}
      />

      <Modal
        visible={modalVisible}
        handleModalClose={handleModalClose}
        passProjectData={passProjectData}
      />
    </div>
  );
}

export default App;
