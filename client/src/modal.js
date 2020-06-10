import React from 'react';
import Autocomplete from './autocomplete';
import './autocomplete.css';
import { getBoardsFromJira, getProjectDataFromJira } from './jira.js';
import CssSpinner from './css-spinner.js';

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
      url: '',
      userId: '',
      password: '',
      corsProxy: '',
      localCorsProxyPort: '',
      availableBoards: [],
      selectedBoard: undefined,
      loading: false,
      nextEnabled: false,
      submitEnabled: false,
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      nextEnabled: this.state.userId !== '' && this.state.url !== '',
    });
  };

  handleRdbCorsChange = event => {
    console.log(event.target);
  };

  // saveJSON = data => {
  //   let bl = new Blob([JSON.stringify(data)], {
  //     type: 'application/json',
  //   });
  //   let a = document.createElement('a');
  //   a.href = URL.createObjectURL(bl);
  //   a.download = 'data.json';
  //   a.hidden = true;
  //   document.body.appendChild(a);
  //   a.innerHTML = 'someinnerhtml';
  //   a.click();
  // };

  handleNext = event => {
    this.setState({ loading: true });
    event.preventDefault();
    const { url, userId, password, corsProxy, localCorsProxyPort } = this.state;
    const shavedUrl = url.replace(/\/$/, '');

    getBoardsFromJira(
      shavedUrl,
      userId,
      password,
      corsProxy,
      localCorsProxyPort
    )
      .then(boards => {
        const availableBoards = [];
        const suggestions = [];
        boards.forEach(board => {
          let boardNameAndId = board.name + ' (' + board.id + ')';
          availableBoards.push({ id: board.id, name: boardNameAndId });
          suggestions.push(boardNameAndId);
        });

        // this.saveJSON(suggestions);

        this.setState({
          availableBoards: availableBoards,
          suggestions: suggestions,
          loading: false,
          currentPage: 1,
        });
      })
      .catch(error => {
        alert(error);
        this.setState({
          loading: false,
        });
      });
  };

  handleBoardChange = value => {
    const submitEnabled = value !== '';
    const selectedBoard = this.state.availableBoards.find(
      board => board.name === value
    );
    this.setState({
      selectedBoard: selectedBoard,
      submitEnabled: submitEnabled,
    });
  };

  handleCancel = event => {
    event.preventDefault();
    this.props.handleModalClose();
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ loading: true });

    getProjectDataFromJira(
      this.state.url,
      this.state.userId,
      this.state.password,
      this.state.selectedBoard.id,
      this.state.corsProxy,
      this.state.localCorsProxyPort
    )
      .then(projectData => {
        // Call the callback given in props to pass project data to App
        if (projectData !== {}) {
          this.props.passProjectData(projectData);
        } else {
          alert('Reading of project data failed');
        }

        this.setState({ loading: false });
        this.props.handleModalClose();
      })
      .catch(error => {
        alert(error);
        this.setState({
          loading: false,
        });
      });
  };

  handleBack = event => {
    event.preventDefault();
    this.setState({
      currentPage: 0,
    });
  };

  handleKeyDown(event) {
    console.log('handleKeyDown, modal shown');
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
            break;
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
                break;
              default:
            }
        }
      },
      9: () => {
        // Enforce focus trap
        // TODO: improve algorithm so that it selects the next tab index in sequence
        // even when there might be gaps between the given tab index values

        if (this.modalRef.current) {
          const focusableModalElements = Array.from(
            this.modalRef.current.querySelectorAll(
              'a[href], button, textarea, input, select'
            )
          );

          // https://www.jstips.co/en/javascript/calculate-the-max-min-value-from-an-array/
          const minTabIndex = Math.min(
            ...focusableModalElements.map(element => element.tabIndex)
          );
          const maxTabIndex = Math.max(
            ...focusableModalElements.map(element => element.tabIndex)
          );
          const currentTabIndex = document.activeElement.tabIndex;
          const movement = event.shiftKey ? -1 : 1;
          var nextTabIndex = currentTabIndex + movement;
          if (nextTabIndex < minTabIndex) {
            nextTabIndex = maxTabIndex;
          }
          if (nextTabIndex > maxTabIndex) {
            nextTabIndex = minTabIndex;
          }

          const nextElement = focusableModalElements.find(
            element => element.tabIndex === nextTabIndex
          );
          nextElement.focus();
          event.preventDefault();
        }
      },
    };

    if (keys[event.keyCode]) {
      keys[event.keyCode]();
    }
  }

  defaultSubmit(event) {
    event.preventDefault();
  }

  componentDidMount() {
    window.addEventListener(' keydown', this.handleKeyDown, false);
    // following kludge needed for buttons to be enabled when default values are in use
    this.setState({
      nextEnabled: this.state.userId !== '' && this.state.url !== '',
      submitEnabled: this.state.selectedBoard !== undefined,
    });

    this.modalRef = React.createRef();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown, false);
  }

  render() {
    // Render nothing if the "show" prop is false
    if (this.props.visible) {
      return (
        <div id="myModal" key="myModal" className="modal">
          <div id="modalContent" className="modal-content" ref={this.modalRef}>
            <ModalHeader onClick={this.props.handleModalClose} />
            <ModalPage0
              key="ModalPage0"
              show={this.state.currentPage === 0}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              handleInputChange={this.handleInputChange}
              nextEnabled={
                this.state.userId !== '' &&
                this.state.url !== '' &&
                !this.state.loading
              }
              handleNext={this.handleNext}
              handleCancel={this.handleCancel}
              defaultSubmit={this.defaultSubmit}
              showSpinner={this.state.loading}
              handleRdbCorsChange={this.handleRdbCorsChange}
            />
            <ModalPage1
              key="ModalPage1"
              show={this.state.currentPage === 1}
              url={this.state.url}
              userId={this.state.userId}
              password={this.state.password}
              suggestions={this.state.suggestions}
              handleBoardChange={this.handleBoardChange}
              handleBack={this.handleBack}
              submitEnabled={this.state.submitEnabled && !this.state.loading}
              handleSubmit={this.handleSubmit}
              defaultSubmit={this.defaultSubmit}
              showSpinner={this.state.loading}
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
            tabIndex={0}
            type="text"
            id="inpUrl"
            name="url"
            required
            placeholder="Enter server URL"
            value={props.url}
            onChange={props.handleInputChange}
          />

          <label>CORS proxy</label>
          <br />
          <div className="corsRadioButtons">
            <input
              type="radio"
              id="local"
              name="corsProxy"
              value="local"
              className="corsRadio"
              onChange={props.handleInputChange}
            />
            <label htmlFor="local">localhost, port:</label>

            <input
              type="text"
              id="inpPort"
              name="localCorsProxyPort"
              onChange={props.handleInputChange}
            />

            <input
              type="radio"
              id="heroku"
              name="corsProxy"
              value="heroku"
              className="corsRadio"
              onChange={props.handleInputChange}
            />
            <label htmlFor="heroku">Heroku</label>

            <input
              type="radio"
              id="none"
              name="corsProxy"
              value="none"
              className="corsRadio"
              onChange={props.handleInputChange}
            />
            <label htmlFor="none">None</label>
          </div>

          <label htmlFor="inpUserId" id="lblUserId">
            <b>User ID</b>
          </label>
          <input
            tabIndex={1}
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
            tabIndex={2}
            type="password"
            id="inpPassword"
            name="password"
            required
            placeholder="Enter Password or API Token"
            value={props.password}
            onChange={props.handleInputChange}
          />

          <div className="modal-buttons">
            <button
              tabIndex={4}
              type="cancel"
              id="btnCancel"
              className="secondary-button"
              onClick={props.handleCancel}
            >
              Cancel
            </button>

            <button
              tabIndex={3}
              type="submit"
              id="btnNext"
              className="primary-button"
              onClick={props.handleNext}
              disabled={!props.nextEnabled}
            >
              Next
              <CssSpinner visible={props.showSpinner} />
            </button>
          </div>
        </form>
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
            tabIndex={0}
            placeholder="Enter or select board ..."
            onValueChange={props.handleBoardChange}
            suggestions={props.suggestions}
          />

          <div className="modal-buttons">
            <button
              tabIndex={2}
              id="btnBack"
              className="secondary-button"
              onClick={props.handleBack}
            >
              Back
            </button>
            <button
              tabIndex={1}
              type="submit"
              id="btnSubmit"
              className="primary-button"
              onClick={props.handleSubmit}
              disabled={!props.submitEnabled}
            >
              Go
              <CssSpinner visible={props.showSpinner} />
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    return null;
  }
}

export default Modal;
