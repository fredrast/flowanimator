import React from "react";
import { render } from "react-dom";
import Autocomplete from "./autocomplete";
import "./autocomplete.css";
import { jira } from "./jira.js";
// import { Spinner } from '../node_modules/spin.js/spin.js';
// import { autoComplete } from './autoComplete/auto-complete.js';

/**
 * @className Modal
 * @description
 * @learningsource https://daveceddia.com/open-modal-in-react/
 * @param
 */

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      url: "",
      userId: "",
      password: "",
      boardNames: [],
      boardIds: [],
      board: "",
      showSpinner: false,
      goEnabled: false
    };
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleNext = event => {
    event.preventDefault();
    console.log(this.state);
    const { url, userId, password } = this.state;
    // remove any trailing slash in the URL
    const shavedUrl = url.replace(/\/$/, "");

    this.setState({ showSpinner: true });

    jira
      .getBoardsFromJira(shavedUrl, userId, password)
      .then(boards => {
        const boardNames = [];
        const boardIds = [];
        boards.forEach(board => {
          boardNames.push(board.name);
          boardIds.push(board.id);
        });

        // const boardAutoComplete = new autoComplete({
        //   selector: '#inpBoard',
        //   minChars: 0,
        //   source: function(term, suggest) {
        //     term = term.toLowerCase();
        //     var suggestions = [];
        //     boardNames.forEach(boardName => {
        //       if (boardName.toLowerCase().includes(term))
        //         suggestions.push(boardName);
        //     });
        //     suggest(suggestions);
        //   },
        //   onSelect: function(e, term, item) {
        //     this.setState({
        //       goEnabled: true,
        //     });
        //   },
        // });

        this.setState({
          boardNames: boardNames,
          suggestions: boardNames,
          boardIds: boardIds,
          showSpinner: false,
          currentPage: 1
        });
      })
      .catch(error => {
        alert(error);
        this.setState({
          showSpinner: false
        });
      });
  };

  handleBoardChange = event => {
    console.log(event);
    // document.getElementById('inpBoard').oninput = function(event) {
    //   if (boardNames.indexOf(this.value) >= 0) {
    //     document.getElementById('btnGo').disabled = false;
    //     document.getElementById('btnGo').focus();
    //   } else {
    //     document.getElementById('btnGo').disabled = true;
    //   }
    // };
  };

  handleCancel = event => {
    event.preventDefault();
    this.props.closeModal();
  };

  handleSubmit = event => {
    event.preventDefault();
  };

  handleBack = event => {
    event.preventDefault();
    this.setState({
      currentPage: 0
    });
  };

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    // Render nothing if the "show" prop is false
    if (this.props.visible) {
      return (
        <div id="myModal" className="modal">
          <div id="modalContent" className="modal-content">
            <ModalHeader onClick={this.props.closeModal} />
            <ModalPage0
              show={this.state.currentPage == 0}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              handleInputChange={this.handleInputChange}
              handleNext={this.handleNext}
              handleCancel={this.handleCancel}
            />
            <ModalPage1
              show={this.state.currentPage == 1}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              suggestions={this.state.suggestions}
              handleBoardChange={this.handleBoardChange}
              handleBack={this.handleBack}
              handleSubmit={this.handleSubmit}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  } // render
} // Modal

function ModalHeader(props) {
  return (
    <div className="modal-header">
      <span id="btnClose" onClick={props.onClick}>
        &times;
      </span>
    </div>
  );
}

function handleSubmit(event) {
  console.log("Form submitted");
  event.preventDefault();
}

function ModalPage0(props) {
  if (props.show) {
    return (
      <div id="modalPage0" className="modal-page">
        <h2>Enter Jira login details</h2>
        <form className="form-container">
          <label htmlFor="inpUrl">
            <b>Jira server</b>
          </label>
          <input
            tabIndex={1}
            type="text"
            id="inpUrl"
            name="url"
            required
            placeholder="Enter server URL (including possible CORS proxy)"
            value={props.url}
            onChange={props.handleInputChange}
          />

          <label htmlFor="inpUserId">
            <b>User ID</b>
          </label>
          <input
            tabIndex={2}
            type="text"
            id="inpUserId"
            name="userId"
            required
            placeholder="Enter User ID"
            value={props.userId}
            onChange={props.handleInputChange}
          />

          <label htmlFor="inpPassword">
            <b>Password or API Token</b>
          </label>
          <input
            tabIndex={3}
            type="password"
            id="inpPassword"
            name="password"
            required
            placeholder="Enter Password or API Token"
            value={props.password}
            onChange={props.handleInputChange}
          />
        </form>

        <div className="modal-buttons">
          <button
            tabIndex={5}
            id="btnCancel"
            className="secondary-button"
            onClick={props.handleCancel}
          >
            Cancel
          </button>

          <button
            tabIndex={4}
            id="btnNext"
            className="primary-button"
            onClick={props.handleNext}
          >
            Next
          </button>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

function ModalPage1(props) {
  if (props.show) {
    return (
      <div id="modalPage1" className="modal-page">
        <h2>Select a board from Jira</h2>
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="inpBoard">
            <b>Board</b>
          </label>
          <Autocomplete
            tabIndex={1}
            placeholder="Enter or select board ..."
            onChange={props.handleBoardChange}
            suggestions={props.suggestions}
          />
        </form>
        <div className="modal-buttons">
          <button
            tabIndex={3}
            id="btnBack"
            className="secondary-button"
            onClick={props.handleBack}
          >
            Back
          </button>
          <button
            tabIndex={2}
            id="btnSubmit"
            className="primary-button"
            onClick={props.handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default Modal;
