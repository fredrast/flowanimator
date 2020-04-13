import React from 'react';
import './App.css';
import Modal from './modal.js';

function App() {
  return (
    <div className="App">
      <div id="animationField">
        Here goes the animation <br />
      </div>
      <Modal show="true" />
    </div>
  );
}

export default App;
