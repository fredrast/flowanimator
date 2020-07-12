import React, {
  useState,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
  createRef,
} from 'react';
import CssSpinner from './css-spinner.js';
export function RadioGroup(props) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [wrapperRef] = useState(createRef());

  const updateFocus = () => {
    const wrapperDivFocused = document.activeElement.id === props.id;
    const radioButtonFocused = document.activeElement.name === props.name;
    setFocused(wrapperDivFocused || radioButtonFocused);
  };

  const handleValueChange = event => {
    props.updateValue(event.target.value);
  };

  const handleKeyDown = event => {
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      let movement;
      switch (event.keyCode) {
        case 37: // left
        case 38: // up
          movement = -1;
          break;
        case 39: // right
        case 40: // down
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

      props.updateValue(newValue);
    }
  };

  const radioGroupStyle = {
    padding: '0',
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
    padding: '0 0 5px 0',
  };

  return (
    <div
      tabIndex={props.tabIndex}
      ref={wrapperRef}
      style={radioGroupStyle}
      className={'radio-group'}
      id={props.id}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onKeyDown={handleKeyDown}
      onFocus={updateFocus}
      onBlur={updateFocus}
    >
      <label style={labelStyle}>{props.label}</label>
      <div style={radioButtonsStyle}>
        {props.choices.map(choice => (
          <RadioButton
            choice={choice}
            key={choice.value}
            name={props.name}
            onChange={handleValueChange}
            checked={props.value === choice.value}
            wrapperRef={wrapperRef}
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
    padding: '0',
  };

  const handleFocus = () => {
    if (props.wrapperRef.current) {
      props.wrapperRef.current.focus();
    }
  };

  return (
    <label htmlFor={props.choice.value} style={labelStyle}>
      <input
        style={inputStyle}
        type="radio"
        id={props.choice.value}
        name={props.name}
        value={props.choice.value}
        className="corsRadio"
        checked={props.checked}
        onFocus={handleFocus}
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
    padding: '20px 0 3px 0',
  };

  const labelFontColorStyle = focused ? { color: '#1FA9C1' } : {};

  const labelBaseStyle = {
    position: 'absolute',
    left: '0px',
    margin: '0 auto',
    ...labelFontColorStyle,
  };

  const labelLoweredStyle = {
    ...labelBaseStyle,
    top: '19px',
    fontSize: '1.2em',
    transition: 'all 0.1s ease-in-out',
  };

  const labelRaisedStyle = {
    ...labelBaseStyle,
    top: '3px',
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
    <div className="text-input" style={{ ...divStyle, ...props.style }}>
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
        {focused || props.value !== ''
          ? props.label
          : props.placeholder || props.label}
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

export function TabbedPanels(props) {
  const [tabBarFocused, setTabBarFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const tabBarId = props.id + '-tabBar';

  const handleKeyDown = event => {
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      let movement;
      switch (event.keyCode) {
        case 37: // left
        case 38: // up
          movement = -1;
          break;
        case 39: // right
        case 40: // down
          movement = 1;
      }

      const newSelectionIndex = Math.min(
        Math.max(selectedTab + movement, 0),
        props.tabs.length - 1
      );
      setSelectedTab(newSelectionIndex);
    }
  };

  // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children

  const tabPanels = props.children.map((tabPanel, index) => {
    // Checking isValidElement is the safe way and avoids a TS error too.

    if (isValidElement(tabPanel)) {
      const visible = index === selectedTab;
      return cloneElement(tabPanel, {
        visible: visible,
        key: index,
        index: index,
      });
    }
    return tabPanel;
  });

  const tabbedPanelsStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const tabBarStyle = {
    width: '100%',
    flex: '0 0 auto',
    display: 'flex',
    flexFlow: 'row nowrap',
    outline: 'none',
  };

  return (
    <div className="tabbed-panels" style={tabbedPanelsStyle}>
      <div
        id={tabBarId}
        className="tab-bar"
        style={tabBarStyle}
        tabIndex={props.tabIndex}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setTabBarFocused(true);
        }}
        onBlur={() => {
          setTabBarFocused(false);
        }}
      >
        {props.tabs.map((tab, index) => (
          <Tab
            label={tab}
            key={index}
            index={index}
            selected={selectedTab === index}
            setSelectedTab={setSelectedTab}
            tabBarFocused={tabBarFocused}
          />
        ))}
      </div>
      {tabPanels}
    </div>
  );
}

function Tab(props) {
  const [hover, setHover] = useState(false);

  const tabBarFocusedStyle = props.tabBarFocused
    ? {
        color: '#1FA9C1',
        borderColor: '#25c0dc',
      }
    : {};

  const tabHoverStyle =
    hover && !props.selected
      ? {
          fontWeight: 'bold',
          letterSpacing: '0px',
        }
      : {};

  const tabSelectedStyle = props.selected
    ? {
        fontWeight: 'bold',
        letterSpacing: '0px',
        borderColor: '#ccc',
        ...tabBarFocusedStyle,
      }
    : {};

  const tabStyle = {
    flex: '0 0 auto',
    width: '100px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    borderBottom: 'solid',
    borderColor: '#eee',
    textAlign: 'center',
    ...tabHoverStyle,
    ...tabSelectedStyle,
  };

  return (
    <div
      id={'tab' + props.index}
      key={props.index}
      style={tabStyle}
      onMouseDown={() => {
        props.setSelectedTab(props.index);
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      {props.label}
    </div>
  );
}

export function TabPanel(props) {
  const tabPanelStyle = { flex: '1 1 auto' };

  if (props.visible) {
    return (
      <div id={props.id} style={tabPanelStyle} className={'tab-panel'}>
        {props.children}
      </div>
    );
  } else {
    return null;
  }
}

export function MultiPageForm(props) {
  const [selectedPage, setSelectedPage] = useState(0);

  const scrollPage = movement => {
    const newSelectedPage = Math.min(
      Math.max(selectedPage + movement, 0),
      props.children.length - 1
    );
    if (newSelectedPage !== selectedPage) {
      setSelectedPage(newSelectedPage);
    }
  };

  const children = props.children.map((child, index) => {
    // Checking isValidElement is the safe way and avoids a TS error too.
    if (isValidElement(child)) {
      const visible = index === selectedPage;
      return cloneElement(child, {
        visible: visible,
        key: index,
        scrollPage: scrollPage,
      });
    }
    return children;
  });

  return <div>{children}</div>;
}

export function FormPage(props) {
  const [maxTabIndex, setMaxTabIndex] = useState(-1);
  useEffect(() => {
    let newMaxTabIndex = -1;
    React.Children.toArray(props.children).forEach(child => {
      if (child.props && child.props.tabIndex > maxTabIndex) {
        newMaxTabIndex = child.props.tabIndex;
      }
    });
    setMaxTabIndex(newMaxTabIndex);
  }, [props.children]);

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const formHeaderStyle = {};

  const formContentStyle = {
    flex: '10 10 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  };

  const buttonBarStyle = {
    display: 'flex',
    flexDirection: 'row-reverse',
  };

  const buttonStyle = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    outline: 'none',
    borderWidth: '3px',
    fontSize: '1.2em',
    cursor: 'pointer',
    width: '150px',
    height: '50px',
    borderRadius: '15px',
  };

  const forwardButton = ({ forwardButton, tabIndex }) => {
    if (forwardButton) {
      const successCallback = () => {
        props.scrollPage(1);
      };

      const clickForward = event => {
        event.preventDefault();
        if (
          (forwardButton.onClick && forwardButton.onClick(successCallback)) ||
          !forwardButton.onClick
        ) {
          props.scrollPage(1);
        }
      };

      const forwardButtonStyle = {
        ...buttonStyle,
        margin: '0px 0px 0px 8px',
      };

      return (
        <button
          tabIndex={tabIndex}
          className="primary-button"
          style={forwardButtonStyle}
          onClick={clickForward}
          disabled={forwardButton.disabled}
        >
          {forwardButton.label}
          <CssSpinner visible={forwardButton.showSpinner} />
        </button>
      );
    }
  };

  const backwardButton = ({ backwardButton, tabIndex }) => {
    const clickBackward = event => {
      event.preventDefault();
      if (
        (backwardButton.onClick && backwardButton.onClick()) ||
        !backwardButton.onClick
      ) {
        props.scrollPage(-1);
      }
    };

    const backwardButtonStyle = {
      ...buttonStyle,
    };

    if (backwardButton) {
      return (
        <button
          tabIndex={tabIndex}
          className="secondary-button"
          style={backwardButtonStyle}
          onClick={clickBackward}
          disabled={backwardButton.disabled}
        >
          {backwardButton.label}
        </button>
      );
    }
  };

  if (props.visible) {
    return (
      <form
        style={formStyle}
        className={'form-page'}
        onSubmit={event => {
          event.preventDefault();
        }}
      >
        <div style={formHeaderStyle} className="form-header">
          <h1>{props.header}</h1>
          {props.subheader ? <h2>{props.subheader}</h2> : ''}
        </div>
        <div style={formContentStyle} className="form-content">
          {props.children}
        </div>
        <div style={buttonBarStyle} className="form-button-bar">
          {forwardButton({
            ...props,
            tabIndex: maxTabIndex + 1,
          })}
          {backwardButton({ ...props, tabIndex: maxTabIndex + 2 })}
        </div>
      </form>
    );
  } else {
    return null;
  }
}
