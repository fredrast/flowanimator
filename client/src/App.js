import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './control-panel.js';
import './control-panel.css';
import Animation from './animation.js';
import './animation.css';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState(undefined);
  const [playing, setPlaying] = useState(false);

  /* console.log('Render App'); */

  useEffect(() => {
    // To auto-load test data without having to go through modal
    const sampleProjectData = require('./test-data/project-data.json');
    setProjectData(sampleProjectData);
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
    // saveJSON(projectData);
  };

  /*function saveJSON(data) {
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
  }*/

  const handleAnimationFinished = () => {
    setPlaying(false);
  };
  /* console.log('Render App'); */

  return (
    <div className="App">
      <Animation
        projectData={projectData}
        playing={playing}
        handleAnimationFinished={handleAnimationFinished}
      />
      <ControlPanel
        playControlsEnabled={projectData !== undefined}
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