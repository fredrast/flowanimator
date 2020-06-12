import React from 'react';

export default function Info(props) {
  if (props.visible) {
    return (
      <div id="infoModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <span
              id="btnClose"
              onClick={() => {
                props.setShowInfo(false);
              }}
            >
              &times;
            </span>
          </div>
          <h1>Welcome to Flow Animator!</h1>
          <h2>About</h2>
          <span> ...</span>
          <h2>Usage</h2>
          <h2>Dealing with CORS</h2>
          <h2>Comments and suggestions appreciated!</h2>
          <span />
        </div>
      </div>
    );
  } else {
    return null;
  }
}
