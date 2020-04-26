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
  const [jiraData, setJiraData] = useState(null);

  const handleOpenClick = () => {
    setModalVisible(true);
    console.log('handleOpenClick');
  };
  const handlePlayClick = () => {};
  const handleStopClick = () => {};
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const passJiraData = jiraData => setJiraData(jiraData);

  return (
    <div className="App">
      <Animation jiraData={jiraData} />

      <ControlPanel
        handleOpenClick={handleOpenClick}
        handlePlayClick={handlePlayClick}
        handleStopClick={handleStopClick}
        disabled={modalVisible}
      />

      <Modal
        visible={modalVisible}
        handleModalClose={handleModalClose}
        passJiraData={passJiraData}
      />
    </div>
  );
}

export default App;
