import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './control-panel.js';
import './control-panel.css';
import Animation from './animation.js';
import './animation.css';
import { getProjectData } from './project-data.js';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState();
  const [playing, setPlaying] = useState(false);
  const [playControlsEnabled, setPlayControlsEnabled] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // To auto-load test data without having to go through modal
    setProjectData(getProjectData());
  }, []);

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
    saveJSON(projectData);
  };

  const handleMouseMove = event => {
    setMouseCoords({ x: event.clientX, y: event.clientY });
  };

  function saveJSON(data) {
    let bl = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(bl);
    a.download = 'data.json';
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = 'someinnerhtml';
    a.click();
  }

  const handleAnimationBuildStarted = () => {
    setPlayControlsEnabled(true);
  };

  const handleAnimationFinished = () => {
    setPlaying(false);
  };
  /* console.log('Render App'); */

  return (
    <div className="App" onMouseMove={handleMouseMove}>
      mouse coords: {mouseCoords.x}, {mouseCoords.y}
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
