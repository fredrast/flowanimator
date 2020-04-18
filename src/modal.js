import React from 'react';
import { render } from 'react-dom';
import Autocomplete from './autocomplete';
import './autocomplete.css';
import { jira } from './jira.js';
import { Spinner } from 'spin.js';

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
      url: 'http://127.0.0.1:8080/https://fredrikastrom.atlassian.net',
      userId: 'fredrik.astrom@iki.fi',
      password: '68pANgVAV21hiVCcLdBCF310',
      boardNames: [],
      boardIds: [],
      board: '',
      showSpinner: false,
      nextEnabled: false,
      submitEnabled: false,
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      nextEnabled: this.state.userId != '' && this.state.url != '',
      submitEnabled: this.state.board != '',
    });
    /* console.log('User ID:' + this.state.userId); */
    /* console.log('URL: ' + this.state.url); */
    /* console.log(this.state.userId != ''); */
    /* console.log(this.state.url != ''); */
    /* console.log(this.state.userId != '' && this.state.url != ''); */
    /* console.log(); */
  };

  handleNext = event => {
    event.preventDefault();
    /* console.log('handleNext'); */
    const { url, userId, password } = this.state;
    // remove any trailing slash in the URL
    const shavedUrl = url.replace(/\/$/, '');

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
          currentPage: 1,
        });
      })
      .catch(error => {
        alert(error);
        this.setState({
          showSpinner: false,
        });
      });
  };

  handleBoardChange = event => {
    /* console.log('handleBoardChange'); */
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
    this.props.handleModalClose();
  };

  handleSubmit = event => {
    /* console.log('handleSubmit'); */
    event.preventDefault();
  };

  handleBack = event => {
    /* console.log('handleBack'); */
    event.preventDefault();
    this.setState({
      currentPage: 0,
    });
  };

  handleKeyDown(event) {
    /* console.log('handleKeyDown'); */
    /* console.log(event); */
    /* console.log(event.keyCode); */
    /* console.log('this.state.submitEnabled: ' + this.state.submitEnabled); */
    /* console.log(); */
    const { handleModalClose } = this.props;
    const keys = {
      27: () => {
        event.preventDefault();
        handleModalClose();
        // window.removeEventListener('keyup', this.handleKeyUp, false);
      },
      13: () => {
        switch (event.target.id) {
          case 'btnCancel':
            handleModalClose();
            break;
          case 'btnNext':
            if (this.state.nextEnabled) {
              this.handleNext(event);
            }
            break;
          case 'btnBack':
            this.handleBack(event);
            break;
          case 'btnSubmit':
            if (this.state.submitEnabled) {
              this.handleSubmit(event);
            }
          default:
            switch (this.state.currentPage) {
              case 0:
                if (this.state.nextEnabled) {
                  this.handleNext(event);
                }
                break;
              case 1:
                if (this.state.submitEnabled) {
                  this.handleSubmit(event);
                }
            }
        }
      },
    };

    if (keys[event.keyCode]) {
      keys[event.keyCode]();
    }
  }

  defaultSubmit(event) {
    event.preventDefault();
    /* console.log('Default form submit triggered.'); */
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown, false);
    // following kludge needed for buttons to be enabled when default values are in use
    this.setState({
      nextEnabled: this.state.userId != '' && this.state.url != '',
      submitEnabled: this.state.board != '',
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown, false);
  }

  render() {
    // Render nothing if the "show" prop is false
    if (this.props.visible) {
      return (
        <div id="myModal" key="myModal" className="modal">
          <div id="modalContent" className="modal-content">
            <ModalHeader onClick={this.props.handleModalClose} />
            <Spinner show={this.state.showSpinner} />
            <ModalPage0
              key="ModalPage0"
              show={this.state.currentPage == 0}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              handleInputChange={this.handleInputChange}
              nextEnabled={this.state.userId != '' && this.state.url != ''}
              handleNext={this.handleNext}
              handleCancel={this.handleCancel}
              defaultSubmit={this.defaultSubmit}
            />
            <ModalPage1
              key="ModalPage1npm "
              show={this.state.currentPage == 1}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              suggestions={this.state.suggestions}
              handleBoardChange={this.handleBoardChange}
              handleBack={this.handleBack}
              submitEnabled={this.state.board != ''}
              handleSubmit={this.handleSubmit}
              defaultSubmit={this.defaultSubmit}
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

function Spinner(props) {
  var spinnerOpts = {
    lines: 11, // The number of lines to draw
    length: 0, // The length of each line
    width: 24, // The line thickness
    radius: 40, // The radius of the inner circle
    scale: 1.2, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#25c0dc', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 0.5, // Rounds per second
    rotate: 35, // The rotation offset
    animation: 'spinner-line-shrink', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '44%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute', // Element positioning
  };

  const spinner = new Spinner(spinnerOpts);

  //spinner.spin(document.getElementById('modalPage1'));
  // BOOKMARK

  return <div />;
}

function ModalPage0(props) {
  if (props.show) {
    return (
      <div id="modalPage0" className="modal-page">
        <h2>Enter Jira login details</h2>
        <form className="form-container" onSubmit={props.defaultSubmit}>
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
            type="cancel"
            id="btnCancel"
            className="secondary-button"
            onClick={props.handleCancel}
          >
            Cancel
          </button>

          <button
            tabIndex={4}
            type="submit"
            id="btnNext"
            className="primary-button"
            onClick={props.handleNext}
            disabled={!props.nextEnabled}
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
        <form className="form-container" onSubmit={props.defaultSubmit}>
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
            type="submit"
            id="btnSubmit"
            className="primary-button"
            onClick={props.handleSubmit}
            disabled={!props.submitEnabled}
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
