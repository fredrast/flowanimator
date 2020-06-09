import React, { memo, useRef, useState } from 'react';
import './story-popup.css';

function StoryPopup(props) {
  const [x, setX] = useState(200);
  const [y, setY] = useState(200);
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

function PopupBody(props) {
  const createdDate = new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(props.story.fields.created));

  const completedDate = props.story.fields.resolutiondate
    ? new Intl.DateTimeFormat('fi-FI', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(new Date(props.story.fields.resolutiondate))
    : '';

  return (
    <div className="popup-body">
      <table>
        <tbody>
          <tr>
            <td>Id</td>
            <td>{props.story.id}</td>
          </tr>
          <tr>
            <td>Summary</td>
            <td>{props.story.fields.summary}</td>
          </tr>
          <tr>
            <td>Issuetype</td>
            <td>{props.story.fields.issuetype.name}</td>
          </tr>
          <tr>
            <td>Created</td>
            <td>{createdDate}</td>
          </tr>
          <tr>
            <td>Created by</td>
            <td>{props.story.fields.creator.displayName}</td>
          </tr>
          <tr>
            <td>Completed</td>
            <td>{completedDate}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default memo(StoryPopup);
