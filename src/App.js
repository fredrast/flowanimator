import React, { useState } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './controlpanel.js';
import './controlpanel.css';
import Animation from './animation.js';
import './animation.css';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState();
  const [playControlsStatus, setPlayControlsStatus] = useState();

  const handleOpenClick = () => {
    setModalVisible(true);
  };
  const handlePlayClick = () => {};
  const handleStopClick = () => {};
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const passProjectData = projectData => {
    console.log('setProjectData');
    setProjectData(projectData);
  };

  const passPlayControlStatus = playControlsStatus => {
    // setPlayControlsStatus(playControlsStatus);
  };

  return (
    <div className="App">
      <Animation
        projectData={projectData}
        passPlayControlStatus={passPlayControlStatus}
      />

      <ControlPanel
        playControlsStatus={playControlsStatus}
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
