import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

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
      value: '',
    };
  }

  // Event fired when the input value is changed
  onChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    // Filter our suggestions that don't contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
    // Update the user input and filtered suggestions, reset the active
    // suggestion and make sure the suggestions are shown
    this.setState({
      filteredSuggestions,
      showSuggestions: true,
      userInput: userInput,
      value: userInput,
    });
  };

  // Event fired when the input value is changed
  onFocus = e => {
    this.setState({
      showSuggestions: true,
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
  onClick = e => {
    // Update the user input and reset the rest of the state
    this.setState({
      filteredSuggestions: [],
      showSuggestions: false,
      value: e.currentTarget.innerText,
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
          value:
            activeSuggestion >= 0 ? filteredSuggestions[activeSuggestion] : '',
        });
        break;
      // User pressed the down arrow, increment the index
      case 40:
        if (activeSuggestion < filteredSuggestions.length - 1) {
          const selectedSuggestion = activeSuggestion + 1;
          this.setState({
            activeSuggestion: selectedSuggestion,
            value: filteredSuggestions[selectedSuggestion],
          });
        }
        break;
      // User pressed the up arrow, decrement the index
      case 38:
        if (activeSuggestion >= 1) {
          const selectedSuggestion = activeSuggestion - 1;
          this.setState({
            activeSuggestion: selectedSuggestion,
            value: filteredSuggestions[selectedSuggestion],
          });
        } else if (activeSuggestion == 0) {
          this.setState({
            activeSuggestion: -1,
            value: userInput,
          });
        }
        const inpBoard = document.getElementById('inpBoard');
        console.log(inpBoard);
        inpBoard.setSelectionRange(
          inpBoard.value.length,
          inpBoard.value.length
        );
        break;

      default:
    }
  };

  render() {
    const {
      onChange,
      onFocus,
      onBlur,
      onClick,
      onMouseOver,
      onMouseOut,
      onKeyDown,
      state: { activeSuggestion, filteredSuggestions, showSuggestions, value },
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
                  onClick={onClick}
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
          onFocus={onChange}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={value}
          tabIndex={tabIndex}
          placeholder={placeholder}
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;
