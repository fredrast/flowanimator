import React, {
  useState,
  useEffect,
  Children,
  isValidElement,
  cloneElement
} from "react";
import { useSpring, animated, config, useTransition } from "react-spring";
import { rgba } from "polished";

export function RadioGroup(props) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const wrapperDivFocused = document.activeElement.id === props.id;
    const radioButtonFocused = document.activeElement.name === props.name;
    setFocused(wrapperDivFocused || radioButtonFocused);
  });

  const handleValueChange = event => {
    const { name, value } = event.target;
    props.updateState(name, value);
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

      props.updateState(props.name, newValue);
    }
  };

  const radioGroupStyle = {
    padding: "10px 0",
    outline: "none",
    border: "none"
  };

  const labelFontColorStyle = focused
    ? { color: "#1FA9C1", fontWeight: "bold" }
    : {};

  const labelStyle = {
    display: "block",
    fontSize: "0.9em",
    padding: "0 0 10px 0 ",
    ...labelFontColorStyle
  };

  const radioButtonsStyle = {
    padding: "0 0 10px 0 "
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
            key={choice.value}
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
    width: "30px",
    margin: "0px 0px 0px 0px",
    display: "inline-block"
  };

  const labelStyle = {
    padding: "0 5px 0 0"
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
    position: "relative",
    padding: "30px 0 10px 0"
  };

  const labelFontColorStyle = focused ? { color: "#1FA9C1" } : {};

  const labelBaseStyle = {
    position: "absolute",
    left: "0px",
    margin: "0 auto",
    position: "absolute",
    ...labelFontColorStyle
  };

  const labelLoweredStyle = {
    ...labelBaseStyle,
    top: "29px",
    fontSize: "1.2em",
    transition: "all 0.1s ease-in-out"
  };

  const labelRaisedStyle = {
    ...labelBaseStyle,
    top: "13px",
    fontSize: "0.9em",
    fontWeight: "bold",
    transition: "all 0.2s ease-in-out"
  };

  const labelRaised = focused || props.value !== "";

  const labelStyle = labelRaised ? labelRaisedStyle : labelLoweredStyle;

  const inputStyle = {
    position: "relative",
    top: "0px",
    background: "transparent",
    padding: "0 0 4px 0",
    height: "20px",
    width: "100%",
    fontSize: "1.2em",
    textIndent: "0px",
    zIndex: 11,
    outline: "none",
    border: "none"
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
        {focused || props.value !== ""
          ? props.label
          : props.placeholder || props.label}
      </label>
      <FocusLine hover={hover} focused={focused} />
    </div>
  );
}

function FocusLine(props) {
  const lineBaseStyle = {
    position: "relative",
    width: "100%",
    height: "3px",
    border: "none",
    borderRadius: "1px"
  };

  const lineHoverStyle = props.hover
    ? {
        opacity: 1,
        height: "3px"
      }
    : {
        opacity: 0.6
      };

  const unfocusedLineStyle = {
    ...lineBaseStyle,
    ...lineHoverStyle,
    backgroundColor: "#bbb"
  };

  const focusedLineHiddenStyle = props.focused ? {} : { width: "0px" };

  const focusedLineStyle = {
    ...lineBaseStyle,
    ...focusedLineHiddenStyle,
    top: "-3px",
    height: "3px",
    backgroundColor: "#25c0dc",
    transition: "all 0.2s ease-in-out"
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

  const tabBarId = props.id + "-tabBar";

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

  const tabPanels = props.children.map(tabPanel => {
    // Checking isValidElement is the safe way and avoids a TS error too.

    if (isValidElement(tabPanel)) {
      const visible = tabPanel.props.index === selectedTab;
      return cloneElement(tabPanel, {
        visible: visible,
        key: tabPanel.props.index
      });
    }
    return tabPanel;
  });

  const tabbedPanelsStyle = {
    display: "flex",
    flexDirection: "column"
  };

  const tabBarStyle = {
    width: "100%",
    flex: "0 0 auto",
    display: "flex",
    flexFlow: "row nowrap",
    outline: "none"
  };

  return (
    <div className="tabbedPanels" style={tabbedPanelsStyle}>
      <div
        id={tabBarId}
        className="tabBar"
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

  console.log("Render tab " + props.index);
  console.log("Tab bar focused: " + props.tabBarFocused);

  const tabBarFocusedStyle = props.tabBarFocused
    ? {
        color: "#1FA9C1",
        borderColor: "#25c0dc"
      }
    : {};

  const tabHoverStyle =
    hover && !props.selected
      ? {
          fontWeight: "bold",
          letterSpacing: "0px"
        }
      : {};

  const tabSelectedStyle = props.selected
    ? {
        fontWeight: "bold",
        letterSpacing: "0px",
        borderColor: "#ccc",
        ...tabBarFocusedStyle
      }
    : {};

  const tabStyle = {
    flex: "0 0 auto",
    width: "100px",
    cursor: "pointer",
    letterSpacing: "0.5 px",
    borderBottom: "solid",
    borderColor: "#eee",
    textAlign: "center",
    ...tabHoverStyle,
    ...tabSelectedStyle
  };

  return (
    <div
      id={"tab" + props.index}
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
  const tabPanelStyle = { flex: "1 1 auto" };

  if (props.visible) {
    return <div style={tabPanelStyle}>{props.children}</div>;
  } else {
    return null;
  }
}

export function Modal(props) {
  const [resetAnimation, setResetAnimation] = useState(false);

  const rollUpAnimation = useSpring({
    config: { mass: 2, tension: 125, friction: 22 },
    top: 0,
    from: { top: 160 },
    reset: resetAnimation,
    onStart: () => {
      setResetAnimation(false);
    }
  });

  useEffect(() => {
    if (props.visible) {
      setResetAnimation(true);
    }
  }, [props.visible]);

  useEffect(() => {
    const handleKeyDown = event => {
      // Close form if Esc is pressed
      if (event.keyCode === 27) {
        event.preventDefault();
        props.closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown, false);

    return () => {
      window.RemoveEventListener("keydown", handleKeyDown, false);
    };
  }, []);

  const modalBackgroundStyle = {
    display: "flex",
    overflow: "hidden",
    position: "fixed",
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: rgba(0, 0, 0, 0.6)
  };

  const modalWindowStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    borderRadius: "25px"
  };

  const modalHeaderStyle = {
    flex: 0
  };

  const closeButtonStyle = {
    margin: 0,
    padding: 0,
    position: "absolute",
    top: "3px",
    right: "12px",
    fontSize: "28px",
    fontWeight: "bold",
    opacity: 0.6,
    backgroundColor: rgba(1, 1, 1, 0),
    border: "none"
  };

  /* const content = (
    <animated.div
      style={{ ...modalWindowStyle, ...rollUpAnimation }}
      className="modal-window"
    >
      <div className="modal-header">
        <HoverFocusedButton
          defaultStyle={closeButtonStyle}
          hoverStyle={{ opacity: 1 }}
          focusedStyle={{ opacity: 1 }}
          className="close-button"
          onClick={() => {
            props.closeModal();
          }}
        >
          &times;
        </HoverFocusedButton>
      </div>
      <div className="modal-body">{props.children}</div>
    </animated.div>
  ); */

  /*
  const item = { id: props.id, visible: props.visible, content: content };


  const fadeInOut = useTransition(item, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.slow
  }); */

  const fadeInOut = useTransition(props.visible, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  return fadeInOut.map(({ item, key, props: fadeInOutAnimation }) => {
    return (
      item && (
        <animated.div
          style={{ ...modalBackgroundStyle, ...fadeInOutAnimation }}
          id={props.id}
          key={key}
          className="modal-background"
        >
          <animated.div
            style={{ ...modalWindowStyle, ...rollUpAnimation }}
            className="modal-window"
          >
            <div className="modal-header">
              <HoverFocusedButton
                defaultStyle={closeButtonStyle}
                hoverStyle={{ opacity: 1 }}
                focusedStyle={{ opacity: 1 }}
                className="close-button"
                onClick={() => {
                  props.closeModal();
                }}
              >
                &times;
              </HoverFocusedButton>
            </div>
            <div className="modal-body">{props.children}</div>
          </animated.div>
        </animated.div>
      )
    );
  });
}

function HoverFocusedButton(props) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  const { defaultStyle, hoverStyle, focusedStyle, ...otherProps } = props;
  const appliedHoverStyle = hover ? hoverStyle : {};
  const appliedFocusedStyle = focused ? focusedStyle : {};

  const buttonStyle = {
    ...defaultStyle,
    ...appliedHoverStyle,
    ...appliedFocusedStyle
  };

  return (
    <button
      {...otherProps}
      style={buttonStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {props.children}
    </button>
  );
}
