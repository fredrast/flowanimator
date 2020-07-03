import React, { useState, useEffect } from 'react';
import Autocomplete from './autocomplete';
import './autocomplete.css';
import { getBoardsFromJira, getProjectDataFromJira } from './jira.js';
import CssSpinner from './css-spinner.js';
import { TextInput, RadioGroup } from './controls.js';

/**
 * @className Modal
 * @description
 * @learningsource https://daveceddia.com/open-modal-in-react/
 * @param
 */

function Modal(props) {
  const [state, setState] = useState({
    currentPage: 0,
    url: '',
    userId: '',
    password: '',
    corsProxy: '',
    localCorsProxyPort: '8080',
    availableBoards: [],
    selectedBoard: undefined,
    loading: false,
    nextEnabled: false,
    submitEnabled: false,
  });
  const [modalRef] = useState(React.createRef());

  const updateState = (name, value) => {
    setState(prevState => {
      return {
        ...prevState,
        [name]: value,
        nextEnabled: state.userId !== '' && state.url !== '',
      };
    });
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    updateState(name, value);
  };

  const handleNext = event => {
    setState(prevState => {
      return { ...prevState, loading: true };
    });
    event.preventDefault();
    const { url, userId, password, corsProxy, localCorsProxyPort } = state;
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

        // saveJSON(suggestions);

        setState(prevState => {
          return {
            ...prevState,
            availableBoards: availableBoards,
            suggestions: suggestions,
            loading: false,
            currentPage: 1,
          };
        });
      })
      .catch(error => {
        alert(error);
        setState(prevState => {
          return { ...prevState, loading: false };
        });
      });
  };

  const handleBoardChange = value => {
    const submitEnabled = value !== '';
    const selectedBoard = state.availableBoards.find(
      board => board.name === value
    );
    setState(prevState => {
      return {
        ...prevState,
        selectedBoard: selectedBoard,
        submitEnabled: submitEnabled,
      };
    });
  };

  const handleCancel = event => {
    event.preventDefault();
    props.handleModalClose();
  };

  const handleSubmit = event => {
    event.preventDefault();
    setState(prevState => {
      return { ...prevState, loading: true };
    });

    getProjectDataFromJira(
      state.url,
      state.userId,
      state.password,
      state.selectedBoard.id,
      state.corsProxy,
      state.localCorsProxyPort
    )
      .then(projectData => {
        // Call the callback given in props to pass project data to App
        if (projectData !== {}) {
          props.passProjectData(projectData);
        } else {
          alert('Reading of project data failed');
        }

        setState(prevState => {
          return { ...prevState, loading: false };
        });
        props.handleModalClose();
      })
      .catch(error => {
        alert(error);
        setState(prevState => {
          return { ...prevState, loading: false };
        });
      });
  };

  const handleBack = event => {
    event.preventDefault();
    setState(prevState => {
      return { ...prevState, currentPage: 0 };
    });
  };

  const handleKeyDown = event => {
    const { handleModalClose } = props;
    const keys = {
      // Esc
      27: () => {
        event.preventDefault();
        handleModalClose();
      },
      // Enter
      13: () => {
        switch (event.target.id) {
          case 'btnCancel':
            handleModalClose();
            break;
          case 'btnNext':
            if (state.nextEnabled) {
              handleNext(event);
            }
            break;
          case 'btnBack':
            handleBack(event);
            break;
          case 'btnSubmit':
            if (state.submitEnabled) {
              handleSubmit(event);
            }
            break;
          default:
            switch (state.currentPage) {
              case 0:
                if (state.nextEnabled) {
                  handleNext(event);
                }
                break;
              case 1:
                if (state.submitEnabled) {
                  handleSubmit(event);
                }
                break;
              default:
            }
        }
      },
      // Tab
      9: () => {
        // Enforce focus trap

        if (modalRef.current) {
          const focusableModalElements = Array.from(
            modalRef.current.querySelectorAll('[tabindex]')
          )
            .filter(elem => !elem.disabled)
            .sort((elemA, elemB) => {
              return elemA.tabIndex - elemB.tabIndex;
            });

          const currentSelectedElementIndex = focusableModalElements.indexOf(
            document.activeElement
          );

          console.log(
            'currentSelectedElementIndex: ' + currentSelectedElementIndex
          );

          const movement = event.shiftKey ? -1 : 1;
          var nextSelectedElementIndex = currentSelectedElementIndex + movement;
          console.log('nextSelectedElementIndex: ' + nextSelectedElementIndex);
          if (
            nextSelectedElementIndex < 0 ||
            nextSelectedElementIndex >= focusableModalElements.length
          ) {
            nextSelectedElementIndex = event.shiftKey
              ? focusableModalElements.length - 1
              : 0;
          }
          console.log('nextSelectedElementIndex: ' + nextSelectedElementIndex);
          const nextSelectedElement =
            focusableModalElements[nextSelectedElementIndex];
          console.log(nextSelectedElement);
          nextSelectedElement.focus();
          event.preventDefault();
        }
      },
    };

    if (keys[event.keyCode]) {
      keys[event.keyCode]();
    }
  };

  const defaultSubmit = event => {
    event.preventDefault();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);
    // following kludge needed for buttons to be enabled when default values are in use
    setState(prevState => {
      return {
        ...prevState,
        nextEnabled: state.userId !== '' && state.url !== '',
        submitEnabled: state.selectedBoard !== undefined,
      };
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

  // Render nothing if the "show" prop is false
  if (props.visible) {
    return (
      <div id="myModal" key="myModal" className="modal">
        <div id="modalContent" className="modal-content" ref={modalRef}>
          <ModalHeader onClick={props.handleModalClose} />
          <ModalPage0
            key="ModalPage0"
            show={state.currentPage === 0}
            url={state.url}
            userId={state.userId}
            password={state.password}
            handleInputChange={handleInputChange}
            updateState={updateState}
            nextEnabled={
              state.userId !== '' && state.url !== '' && !state.loading
            }
            handleNext={handleNext}
            handleCancel={handleCancel}
            defaultSubmit={defaultSubmit}
            showSpinner={state.loading}
            corsProxy={state.corsProxy}
            localCorsProxyPort={state.localCorsProxyPort}
          />
          <ModalPage1
            key="ModalPage1"
            show={state.currentPage === 1}
            url={state.url}
            userId={state.userId}
            password={state.password}
            suggestions={state.suggestions}
            handleBoardChange={handleBoardChange}
            handleBack={handleBack}
            submitEnabled={state.submitEnabled && !state.loading}
            handleSubmit={handleSubmit}
            defaultSubmit={defaultSubmit}
            showSpinner={state.loading}
          />
        </div>
      </div>
    );
  } else {
    return null;
  }
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
  const [activeElement, setActiveElement] = useState(document.activeElement);

  useEffect(() => {
    setActiveElement(document.activeElement);
  });

  useEffect(() => {
    const updateActiveElement = () => {
      setActiveElement(document.activeElement);
    };
    window.addEventListener('focusin', updateActiveElement, false);

    return () => {
      window.removeEventListener('focusin', updateActiveElement, false);
    };
  }, []);

  if (props.show) {
    return (
      <div id="modalPage0" className="modal-page">
        <h2>Enter Jira login details</h2>
        <form className="form-container" onSubmit={props.defaultSubmit}>
          <TextInput
            tabIndex={6}
            type="text"
            id="inpUrl"
            name="url"
            required={true}
            label="Server URL"
            value={props.url}
            onChange={props.handleInputChange}
            autoComplete="url"
          />

          <RadioGroup
            tabIndex={7}
            id={'corsSelection'}
            name="corsProxy"
            label="CORS proxy"
            value={props.corsProxy}
            choices={[
              { value: 'heroku', label: 'Heroku' },
              { value: 'localhost', label: 'Local workstation' },
              { value: 'none', label: 'None' },
            ]}
            updateState={props.updateState}
          />

          <TextInput
            tabIndex={8}
            type="text"
            id="inpUserId"
            name="userId"
            required={true}
            label="User ID"
            value={props.userId}
            onChange={props.handleInputChange}
            autoComplete="username"
          />

          <TextInput
            tabIndex={9}
            type="password"
            id="inpPassword"
            name="password"
            required={true}
            label="Password or API Token"
            value={props.password}
            onChange={props.handleInputChange}
            autoComplete="current-password"
          />

          <div className="modal-buttons">
            <button
              tabIndex={15}
              type="cancel"
              id="btnCancel"
              className="secondary-button"
              onClick={props.handleCancel}
            >
              Cancel
            </button>

            <button
              tabIndex={14}
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
