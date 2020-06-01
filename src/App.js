import React, { useState } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './control-panel.js';
import './control-panel.css';
import Animation from './animation.js';
import './animation.css';
// import { getProjectData } from './test-data/project-data.js';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState(undefined);
  const [playing, setPlaying] = useState(false);
  /* console.log('Render App'); */

  /*  useEffect(() => {
    // To auto-load test data without having to go through modal
    setProjectData(getProjectData());
  }, []);
  */

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
    //    saveJSON(projectData);
  };

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
