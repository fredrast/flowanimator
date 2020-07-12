import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './modal.js';
import './modal.css';
import ControlPanel from './control-panel.js';
import './control-panel.css';
import Animation from './animation.js';
import './animation.css';
import Info from './info.js';
import Welcome from './welcome.js';

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectData, setProjectData] = useState(undefined);
  const [playing, setPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // useEffect(() => {
  //   // To auto-load test data without having to go through modal
  //   const sampleProjectData = require('./test-data/project-data.json');
  //   setProjectData(sampleProjectData);
  // }, []);

  const handleOpenClick = () => {
    setModalVisible(true);
  };
  const handlePlayClick = () => {
    setPlaying(!playing);
  };
  const handleStopClick = () => {
    setPlaying(false);
    setAnimationTime(0);
  };
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const passProjectData = projectData => {
    setProjectData(projectData);
    // saveJSON(projectData);
  };

  // function saveJSON(data) {
  //   let bl = new Blob([JSON.stringify(data)], {
  //     type: 'application/json',
  //   });
  //   let a = document.createElement('a');
  //   a.href = URL.createObjectURL(bl);
  //   a.download = 'data.json';
  //   a.hidden = true;
  //   document.body.appendChild(a);
  //   a.innerHTML = 'someinnerhtml';
  //   a.click();
  // }

  const handleAnimationFinished = () => {
    setPlaying(false);
  };
  /* console.log('Render App'); */

  const handleDemoClick = () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch('demo', options)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.status);
        }
      })
      .then(json => {
        setProjectData(json);
      })
      .catch(error => {
        alert(error);
      });
  };

  return (
    <div className="App">
      <Welcome visible={projectData === undefined} />
      <Animation
        projectData={projectData}
        playing={playing}
        handleAnimationFinished={handleAnimationFinished}
        animationTime={animationTime}
        setAnimationTime={setAnimationTime}
      />
      <ControlPanel
        playControlsEnabled={projectData !== undefined}
        playing={playing}
        handleOpenClick={handleOpenClick}
        handlePlayClick={handlePlayClick}
        handleStopClick={handleStopClick}
        handleDemoClick={handleDemoClick}
        disabled={modalVisible}
        setAnimationTime={setAnimationTime}
        setShowInfo={setShowInfo}
      />
      <Modal
        visible={modalVisible}
        handleModalClose={handleModalClose}
        passProjectData={passProjectData}
      />
      <Info visible={showInfo} setShowInfo={setShowInfo} />
    </div>
  );
}

export default App;
