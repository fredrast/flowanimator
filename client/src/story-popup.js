import React, { memo, useRef, useState } from 'react';
import './story-popup.css';

function StoryPopup(props) {
  const POPUP_WIDTH = 250;

  const startX = props.windowDimensions.windowWidth / 2 - POPUP_WIDTH / 2;
  const startY = props.windowDimensions.windowHeight / 4;

  const [x, setX] = useState(startX);
  const [y, setY] = useState(startY);
  const [dragStartX, _setDragStartX] = useState(0);
  const [dragStartY, _setDragStartY] = useState(0);

  // https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
  const dragStartXRef = useRef(dragStartX);
  const dragStartYRef = useRef(dragStartY);

  const setDragStartX = x => {
    _setDragStartX(x);
    dragStartXRef.current = x;
  };

  const setDragStartY = y => {
    _setDragStartY(y);
    dragStartYRef.current = y;
  };

  const popupStyle = {
    left: x,
    top: y,
    width: POPUP_WIDTH + 'px',
  };

  const handleStartDrag = event => {
    console.log('Set dragStartX to ' + event.clientX);
    setDragStartX(event.clientX);
    setDragStartY(event.clientY);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = event => {
    setX(oldX => {
      return oldX + event.clientX - dragStartXRef.current;
    });
    setY(oldY => {
      return oldY + event.clientY - dragStartYRef.current;
    });
    setDragStartX(event.clientX);
    setDragStartY(event.clientY);
  };

  const handleDragEnd = event => {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  if (props.story) {
    return (
      <div id="story-popup" style={popupStyle} onMouseDown={handleStartDrag}>
        <PopupHeader onClick={props.handleClose} />
        <PopupBody story={props.story} />
      </div>
    );
  } else {
    return null;
  }
}

function PopupHeader(props) {
  return (
    <div className="popup-header">
      <span id="btnPopupClose" onClick={props.onClick}>
        &times;
      </span>
    </div>
  );
}

function StaysInStatus(props) {
  return (
    <table class="popup-table">
      <thead>
        <tr>
          <th className="column-1">Status</th>
          <th>Entered</th>
          <th className="column-3">Days in status</th>
        </tr>
      </thead>

      <tbody>
        {props.story.getStatusStays().map(statusStay => (
          <tr key={statusStay.id}>
            <td className="column-1">
              <div>{statusStay.status}</div>
            </td>
            <td className="column-2">{statusStay.date}</td>
            <td className="column-3">{statusStay.days}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PopupBody(props) {
  const completedDate = props.story.fields.resolutiondate
    ? new Intl.DateTimeFormat('fi-FI', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(new Date(props.story.fields.resolutiondate))
    : '';

  return (
    <div className="popup-body">
      <a
        id="popup-key"
        href={props.story.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.story.id}
      </a>
      <div id="popup-summary">{props.story.fields.summary}</div>
      <table class="popup-table">
        <tbody>
          <tr>
            <td className="first-column">Type:</td>
            <td>{props.story.fields.issuetype.name}</td>
          </tr>
          <tr>
            <td>Created by:</td>
            <td>{props.story.fields.creator.displayName}</td>
          </tr>
          <tr>
            <td>Created:</td>
            <td>{props.story.getCreatedDate()}</td>
          </tr>
          <tr>
            <td>Completed:</td>
            <td>{completedDate}</td>
          </tr>
          <tr>
            <td>Cycle time:</td>
            <td>{props.story.getCycleTime()}</td>
          </tr>
          <tr>
            <td>Lead time:</td>
            <td>{props.story.getLeadTime()}</td>
          </tr>
        </tbody>
      </table>
      <StaysInStatus story={props.story} />
    </div>
  );
}

export default memo(StoryPopup);
