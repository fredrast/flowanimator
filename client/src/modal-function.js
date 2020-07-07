import React, { useState, useEffect } from 'react';
import Autocomplete from './autocomplete';
import './autocomplete.css';
import {
  getBoardsFromJira,
  getProjectDataFromJira,
  getBoardsUrl,
  getIssuesUrl,
} from './jira.js';
import CssSpinner from './css-spinner.js';
import {
  TextInput,
  RadioGroup,
  TabbedPanels,
  TabPanel,
  MultiPageForm,
  FormPage,
} from './controls.js';

/**
 * @className Modal
 * @description
 * @learningsource https://daveceddia.com/open-modal-in-react/
 * @param
 */

function Modal(props) {
  const [state, setState] = useState({
    currentPage: 0,
    url: 'https://fredrikastrom.atlassian.net',
    userId: 'fredrik.astrom@iki.fi',
    boardName: '',
    boardId: '',
    password: '',
    corsProxy: '  ',
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

          const movement = event.shiftKey ? -1 : 1;
          var nextSelectedElementIndex = currentSelectedElementIndex + movement;
          if (
            nextSelectedElementIndex < 0 ||
            nextSelectedElementIndex >= focusableModalElements.length
          ) {
            nextSelectedElementIndex = event.shiftKey
              ? focusableModalElements.length - 1
              : 0;
          }
          const nextSelectedElement =
            focusableModalElements[nextSelectedElementIndex];
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
      <div id="mdlLoadData" className="modal-background">
        <div className="modal-window" ref={modalRef}>
          <ModalHeader onClick={props.handleModalClose} />
          <TabbedPanels
            id="tbpLoadMethod"
            tabs={['Load from Jira', 'Paste data']}
            tabIndex={6}
          >
            <TabPanel>
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
            </TabPanel>
            <TabPanel>
              <ModalPagePaste
                url={state.url}
                handleInputChange={handleInputChange}
                passProjectData={props.passProjectData}
                handleModalClose={props.handleModalClose}
              />
            </TabPanel>
          </TabbedPanels>
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
        <h1>Enter Jira login details</h1>
        <form className="form-container" onSubmit={props.defaultSubmit}>
          <TextInput
            tabIndex={7}
            type="text"
            id="inpUrl"
            name="url"
            required={true}
            label="Server URL"
            placeholder="Enter Jira server URL"
            value={props.url}
            onChange={props.handleInputChange}
            autoComplete="url"
          />

          <RadioGroup
            tabIndex={8}
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
            tabIndex={9}
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
            tabIndex={10}
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
              tabIndex={12}
              type="cancel"
              id="btnCancel"
              className="secondary-button"
              onClick={props.handleCancel}
            >
              Cancel
            </button>

            <button
              tabIndex={11}
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
        <h1>Select a board from Jira</h1>
        <form className="form-container" onSubmit={props.defaultSubmit}>
          <Autocomplete
            tabIndex={0}
            label="Board"
            placeholder="Select board..."
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

function ModalPagePaste(props) {
  const [boardName, setBoardName] = useState('');
  const [boardId, setBoardId] = useState('');
  const [filterId, setFilterId] = useState('');
  const [pages, setPages] = useState('?');
  const [maxResults, setMaxResults] = useState(10);
  const [pastedBoardData, setPastedBoardData] = useState('');
  const [parsedBoardData, setParsedBoardData] = useState({});
  const [pastedIssueData, setPastedIssueData] = useState('');
  const [parsedIssueData, setParsedIssueData] = useState({});

  const onTextAreaChange = (event, index) => {
    const eventTarget = event.target;
    const clonedEvent = { ...event };

    setPastedIssueData(prevState => {
      if (clonedEvent.target) {
        return { ...prevState, [index]: clonedEvent.target.value };
      } else {
        console.log('No valid event target');
        return { ...prevState };
      }
    });

    let actualMaxResults = maxResults;
    let totalIssues = 0;
    let issues = {};

    try {
      const pastedJSON = JSON.parse(event.target.value);
      actualMaxResults = pastedJSON.maxResults;
      totalIssues = pastedJSON.total;
      issues = pastedJSON.issues;
    } catch (error) {
      console.log(error);
    }

    setParsedIssueData(prevState => {
      return { ...prevState, [index]: issues };
    });

    setMaxResults(actualMaxResults);

    if (index === 1) {
      let numberOfPages;
      if (totalIssues > 0 && actualMaxResults > 0) {
        numberOfPages = Math.ceil(totalIssues / actualMaxResults);
      } else {
        numberOfPages = '?';
      }
      setPages(numberOfPages);
    }
  };

  function LinksAndTextAreas(props) {
    const linksAndTextAreas = [];
    const numberOfPages = props.pages === '?' ? 1 : props.pages;
    for (let page = 1; page <= numberOfPages; page++) {
      linksAndTextAreas.push(
        <a
          href={getIssuesUrl(props.url, props.filterId, props.maxResults, page)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={props.tabIndex + (page - 1) * 2}
          key={'link' + page}
        >
          {2 + (page - 1) * 2}. Access issue data from Jira Rest API (page{' '}
          {page}/{props.pages})
        </a>
      );

      linksAndTextAreas.push(
        <textarea
          tabIndex={props.tabIndex + (page - 1) * 2 + 1}
          index={page}
          name="issueData"
          key={'textArea' + page}
          wrap="soft"
          value={pastedIssueData[page]}
          placeholder={
            3 + (page - 1) * 2 + '. Paste issue data from page ' + page
          }
          onChange={event => {
            onTextAreaChange(event, page);
          }}
        />
      );
    }
    return linksAndTextAreas;
  }

  const handleNext = () => {
    try {
      setParsedBoardData(JSON.parse(pastedBoardData));
    } catch (error) {
      alert(error);
      return false;
    }
    return true;
  };

  const handleGo = () => {
    const issues = [];

    for (let index in parsedIssueData) {
      if (parsedIssueData.hasOwnProperty(index) && parsedIssueData[index]) {
        issues.push(...parsedIssueData[index]);
      }
    }

    const projectData = {
      serverUrl: props.url,
      boardConf: parsedBoardData,
      issues: issues,
    };
    props.passProjectData(projectData);
    props.handleModalClose();
    return false;
  };

  const handleCancel = () => {
    props.handleModalClose();
    return false;
  };

  return (
    <MultiPageForm>
      <FormPage
        forwardButton={{ label: 'Next', onClick: handleNext }}
        backwardButton={{ label: 'Cancel', onClick: handleCancel }}
        header="Paste JSON data from Jira REST API"
        subheader="1/2 Retrieve and paste board data"
      >
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={9}
        >
          1. Log in to Jira
        </a>
        <TextInput
          tabIndex={7}
          type="text"
          name="url"
          label="2. Enter Jira server URL"
          placeholder="1. Enter Jira server URL"
          value={props.url}
          onChange={props.handleInputChange}
        />
        <TextInput
          tabIndex={8}
          type="text"
          name="boardName"
          label="3. Enter name of Jira board"
          placeholder="2. Enter name of Jira board"
          value={boardName}
          onChange={e => {
            setBoardName(e.target.value);
          }}
        />
        <a
          href={getBoardsUrl(props.url, boardName)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={9}
        >
          4. Look up ID of board from Jira Rest API
        </a>
        <TextInput
          tabIndex={10}
          type="number"
          name="boardId"
          label="5. Enter ID of Jira board"
          value={boardId}
          onChange={e => {
            setBoardId(e.target.value);
          }}
        />

        <a
          href={
            props.url.replace(/\/$/, '') +
            '/rest/agile/1.0/board/' +
            boardId +
            '/configuration'
          }
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={11}
        >
          6. Access board configuration data from Jira Rest API
        </a>

        <textarea
          tabIndex={12}
          name="boardData"
          wrap="soft"
          value={pastedBoardData}
          placeholder={'7. Paste board data'}
          onChange={e => {
            setPastedBoardData(e.target.value);
          }}
        />
      </FormPage>
      <FormPage
        forwardButton={{ label: 'Go', onClick: handleGo }}
        backwardButton={{ label: 'Back' }}
        header="Paste JSON data from Jira REST API"
        subheader="2/2 Retrieve and paste issue data"
      >
        <TextInput
          tabIndex={10}
          type="number"
          id="inpFilter"
          label="1. Enter filter ID"
          name="filterId"
          value={filterId}
          onChange={e => {
            setFilterId(e.target.value);
          }}
        />
        <span className="hint">
          Filter ID found in{' '}
          <a
            href={
              props.url.replace(/\/$/, '') +
              '/rest/agile/1.0/board/' +
              boardId +
              '/configuration'
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            board data
          </a>
          .
        </span>
        <LinksAndTextAreas
          tabIndex={11}
          url={props.url}
          filterId={filterId}
          pages={pages}
          maxResults={maxResults}
        />
      </FormPage>
    </MultiPageForm>
  );
}

export default Modal;
