import React, { useState } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './controlpanel.js';
import './controlpanel.css';
import Animation from './animation.js';
import './animation.css';
import { CSSTransitionGroup } from 'react-transition-group';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState(null);

  const handleOpenClick = () => {
    setModalVisible(true);
    console.log('handleOpenClick');
  };
  const handlePlayClick = () => {};
  const handleStopClick = () => {};
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const passProjectData = projectData => {
    setProjectData(projectData);
    console.log('passProjectData');
    console.log(projectData);
    console.log('');
  };

  return (
    <div className="App">
      <Animation projectData={projectData} />

      <ControlPanel
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
