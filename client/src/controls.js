import React, { useState, useEffect } from 'react';

export function RadioGroup(props) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    console.log('useEffect');
    console.log(document.activeElement);
    const wrapperDivFocused = document.activeElement.id === props.id;
    const radioButtonFocused = document.activeElement.name === props.name;
    setFocused(wrapperDivFocused || radioButtonFocused);
  });

  const handleValueChange = event => {
    const { name, value } = event.target;
    props.updateState(name, value);
  };

  const handleKeyDown = event => {
    console.log(event.keyCode);

    if (event.keyCode >= 37 && event.keyCode <= 40) {
      // left 37
      // up 38
      // right 39
      // down  40
      let movement;
      switch (event.keyCode) {
        case 37:
        case 38:
          movement = -1;
          break;
        case 39:
        case 40:
          movement = 1;
      }

      const currentSelectionIndex = props.choices.indexOf(
        props.choices.find(choice => choice.value === props.value)
      );
      // -1 if no value selected

      const newSelectionIndex = Math.min(
        Math.max(currentSelectionIndex + movement, 0),
        props.choices.length - 1
      );

      const newValue = props.choices[newSelectionIndex].value;

      props.updateState(props.name, newValue);
    }
  };

  const radioGroupStyle = {
    padding: '10px 0',
    outline: 'none',
    border: 'none',
  };

  const labelFontColorStyle = focused
    ? { color: '#1FA9C1', fontWeight: 'bold' }
    : {};

  const labelStyle = {
    display: 'block',
    fontSize: '0.9em',
    padding: '0 0 10px 0 ',
    ...labelFontColorStyle,
  };

  const radioButtonsStyle = {
    padding: '0 0 10px 0 ',
  };

  return (
    <div
      tabIndex={props.tabIndex}
      style={radioGroupStyle}
      id={props.id}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onKeyDown={handleKeyDown}
    >
      <label style={labelStyle}>{props.label}</label>
      <div style={radioButtonsStyle}>
        {props.choices.map(choice => (
          <RadioButton
            choice={choice}
            name={props.name}
            onChange={handleValueChange}
            checked={props.value === choice.value}
          />
        ))}
      </div>
      <FocusLine hover={hover} focused={focused} />
    </div>
  );
}

function RadioButton(props) {
  const inputStyle = {
    width: '30px',
    margin: '0px 0px 0px 0px',
    display: 'inline-block',
  };

  const labelStyle = {
    padding: '0 5px 0 0',
  };

  return (
    <label htmlFor={props.choice} style={labelStyle}>
      <input
        style={inputStyle}
        type="radio"
        id={props.choice.value}
        name={props.name}
        value={props.choice.value}
        className="corsRadio"
        checked={props.checked}
        onChange={props.onChange}
      />
      <span>{props.choice.label}</span>
    </label>
  );
}

export function TextInput(props) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);

  const divStyle = {
    position: 'relative',
    padding: '30px 0 10px 0',
  };

  const labelFontColorStyle = focused ? { color: '#1FA9C1' } : {};

  const labelBaseStyle = {
    position: 'absolute',
    left: '0px',
    margin: '0 auto',
    position: 'absolute',
    ...labelFontColorStyle,
  };

  const labelLoweredStyle = {
    ...labelBaseStyle,
    top: '29px',
    fontSize: '1.2em',
    transition: 'all 0.1s ease-in-out',
  };

  const labelRaisedStyle = {
    ...labelBaseStyle,
    top: '13px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
  };

  const labelRaised = focused || props.value !== '';

  const labelStyle = labelRaised ? labelRaisedStyle : labelLoweredStyle;

  const inputStyle = {
    position: 'relative',
    top: '0px',
    background: 'transparent',
    padding: '0 0 4px 0',
    height: '20px',
    width: '100%',
    fontSize: '1.2em',
    textIndent: '0px',
    zIndex: 11,
    outline: 'none',
    border: 'none',
  };

  return (
    <div className="field" style={divStyle}>
      <input
        tabIndex={props.tabIndex}
        type={props.type}
        id={props.id}
        name={props.name}
        required={props.required}
        value={props.value}
        autoComplete={props.autoComplete}
        style={inputStyle}
        placeholder=""
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
        onFocus={event => {
          setFocused(true);
          if (props.onFocus) props.onFocus(event);
        }}
        onBlur={event => {
          setFocused(false);
          if (props.onBlur) props.onBlur(event);
        }}
        onMouseEnter={event => {
          setHover(true);
          if (props.onMouseEnter) props.onMouseEnter(event);
        }}
        onMouseLeave={event => {
          setHover(false);
          if (props.onMouseLeave) props.onMouseLeave(event);
        }}
      />
      <label htmlFor={props.name} style={labelStyle}>
        {focused ? props.label : props.placeholder || props.label}
      </label>
      <FocusLine hover={hover} focused={focused} />
    </div>
  );
}

function FocusLine(props) {
  const lineBaseStyle = {
    position: 'relative',
    width: '100%',
    height: '3px',
    border: 'none',
    borderRadius: '1px',
  };

  const lineHoverStyle = props.hover
    ? {
        opacity: 1,
        height: '3px',
      }
    : {
        opacity: 0.6,
      };

  const unfocusedLineStyle = {
    ...lineBaseStyle,
    ...lineHoverStyle,
    backgroundColor: '#bbb',
  };

  const focusedLineHiddenStyle = props.focused ? {} : { width: '0px' };

  const focusedLineStyle = {
    ...lineBaseStyle,
    ...focusedLineHiddenStyle,
    top: '-3px',
    height: '3px',
    backgroundColor: '#25c0dc',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div>
      <div style={unfocusedLineStyle} />
      <div style={focusedLineStyle} />
    </div>
  );
}

export function TabbedPanel(props) {
  const tabBarStyle = {};
  const tabStyle = {};
  return (
    <div style={tabBarStyle}>
      props.tabs.map(tab=>
      <div style={tabStyle} />)
    </div>
  );
}
