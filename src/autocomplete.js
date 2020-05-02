import React, { Component, Fragment } from 'react';
// import PropTypes from 'prop-types';

// Based on https://alligator.io/react/react-autocomplete/

class Autocomplete extends Component {
  // static propTypes = {
  //   suggestions: PropTypes.instanceOf(Array),
  //   tabIndex: PropTypes.instanceOf(Number),
  //   placeholder: PropTypes.instanceOf(String),
  // };

  static defaultProps = {
    suggestions: [],
    tabIndex: 0,
    placeholder: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      // The active selection's index
      activeSuggestion: -1,
      // The suggestions that match the user's input
      filteredSuggestions: [],
      // Whether or not the suggestion list is shown
      showSuggestions: false,
      // What the user has entered
      userInput: '',
      inputFieldValue: '',
      selectedValue: '',
    };
  }

  // Event fired when the input is selected or the input value is changed
  onFocusOrChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    // Filter our suggestions that don't contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    // set Selected Value to the user input in case the input corresponds to
    // one of the valid alternatives

    const selectedValue = filteredSuggestions.includes(userInput)
      ? userInput
      : '';
    // if Selected Value changed, call the event handler
    if (selectedValue !== this.state.selectedValue) {
      this.props.onValueChange(selectedValue);
    }

    // Update the user input and filtered suggestions, reset the active
    // suggestion, make sure the suggestions are shown

    this.setState({
      filteredSuggestions,
      showSuggestions: true,
      userInput: userInput,
      inputFieldValue: userInput,
      selectedValue: selectedValue,
    });
  };

  onBlur = e => {
    setTimeout(() => {
      this.setState({
        showSuggestions: false,
      });
    }, 150);
  };

  // Event fired when the user clicks on a suggestion
  onMouseDown = e => {
    const selectedValue = e.currentTarget.innerText;
    // if Selected Value changed, call the event handler
    if (selectedValue !== this.state.selectedValue) {
      this.props.onValueChange(selectedValue);
    }
    // Update the user input and reset the rest of the state
    this.setState({
      filteredSuggestions: [],
      showSuggestions: false,
      inputFieldValue: selectedValue,
      selectedValue: selectedValue,
    });
  };

  onMouseOver = e => {
    const { filteredSuggestions } = this.state;
    // Update the user input and reset the rest of the state
    this.setState({
      activeSuggestion: filteredSuggestions.indexOf(e.currentTarget.innerText),
    });
  };

  onMouseOut = e => {
    this.setState({
      activeSuggestion: -1,
    });
  };

  // Event fired when the user presses a key down
  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions, userInput } = this.state;
    switch (e.keyCode) {
      // User pressed the tab or enter key, update the input and close the
      // suggestions
      case 9:
      case 13:
        this.setState({
          activeSuggestion: -1,
          showSuggestions: false,
        });
        break;
      // User pressed the down arrow, increment the index
      case 40:
        if (activeSuggestion < filteredSuggestions.length - 1) {
          const selectedSuggestion = activeSuggestion + 1;
          const selectedValue = filteredSuggestions[selectedSuggestion];
          // if Selected Value changed, call the event handler
          if (selectedValue !== this.state.selectedValue) {
            this.props.onValueChange(selectedValue);
          }
          this.setState({
            activeSuggestion: selectedSuggestion,
            inputFieldValue: selectedValue,
            selectedValue: selectedValue,
          });
        }
        break;
      // User pressed the up arrow, decrement the index
      case 38:
        if (activeSuggestion >= 1) {
          const selectedSuggestion = activeSuggestion - 1;
          const selectedValue = filteredSuggestions[selectedSuggestion];
          // if Selected Value changed, call the event handler
          if (selectedValue !== this.state.selectedValue) {
            this.props.onValueChange(selectedValue);
          }
          this.setState({
            activeSuggestion: selectedSuggestion,
            inputFieldValue: selectedValue,
            selectedValue: selectedValue,
          });
          // If we scrolled up out of the suggestion list
        } else if (activeSuggestion === 0) {
          // set Selected Value to the user input in case the input corresponds to
          // one of the valid alternatives

          const selectedValue = filteredSuggestions.includes(
            this.state.userInput
          )
            ? this.state.userInput
            : '';
          // if Selected Value changed, call the event handler
          if (selectedValue !== this.state.selectedValue) {
            this.props.onValueChange(selectedValue);
          }

          this.setState({
            activeSuggestion: -1,
            inputFieldValue: userInput,
            selectedValue: selectedValue,
          });
        }

        break;

      default:
    }
  };

  render() {
    const {
      onFocusOrChange,
      onBlur,
      onMouseDown,
      onMouseOver,
      onMouseOut,
      onKeyDown,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        inputFieldValue,
      },
    } = this;

    const { tabIndex, placeholder } = this.props;

    let suggestionsListComponent;

    if (showSuggestions) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className="suggestions" onMouseOut={onMouseOut}>
            {filteredSuggestions.map((suggestion, index) => {
              // Flag the active suggestion with a class
              return (
                <li
                  className={
                    index === activeSuggestion ? 'suggestion-active' : ''
                  }
                  key={suggestion}
                  onMouseDown={onMouseDown}
                  onMouseOver={onMouseOver}
                >
                  {suggestion}
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div className="no-suggestions">
            <em>No board found that matches your search string.</em>
          </div>
        );
      }
    }

    return (
      <Fragment>
        <input
          type="text"
          id="inpBoard"
          onFocus={onFocusOrChange}
          onBlur={onBlur}
          onChange={onFocusOrChange}
          onKeyDown={onKeyDown}
          value={inputFieldValue}
          tabIndex={tabIndex}
          placeholder={placeholder}
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;
