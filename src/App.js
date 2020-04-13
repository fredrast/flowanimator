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

  const handleOpenClick = () => {
    setModalVisible(true);
    console.log("handleOpenClick");
  };
  const handlePlayClick = () => {};
  const handleStopClick = () => {};
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="App">
      <Animation />
      <ControlPanel
        handleOpenClick={handleOpenClick}
        handlePlayClick={handlePlayClick}
        handleStopClick={handleStopClick}
      />
      <Modal visible={modalVisible} closeModal={closeModal} />
    </div>
  );
}

export default App;
