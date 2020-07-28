import React, { useState } from 'react';
import Autocomplete from './autocomplete';
import './autocomplete.css';
import {
  getBoardsFromJira,
  getProjectDataFromJira,
  getBoardsUrl,
  getIssuesUrl,
} from './jira.js';

import {
  Modal,
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

export default function LoadModal(props) {
  const [url, setUrl] = useState('');

  /*
  const updateState = (name, value) => {
    setState(prevState => {
      return {
        ...prevState,
        [name]: value,
        nextEnabled: state.userId !== '' && state.url !== '',
      };
    });
  };*/

  /* const handleKeyDown = useCallback(
    event => {
      const { handleModalClose } = props;
      const keys = {
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
            var nextSelectedElementIndex =
              currentSelectedElementIndex + movement;
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
    },
    [props, modalRef]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [handleKeyDown]);


*/

  if (props.visible) {
    return (
      <Modal
        id="load-modal"
        visible={props.visible}
        closeModal={props.handleModalClose}
      >
        <TabbedPanels
          id="tbpLoadMethod"
          tabs={['Load from Jira', 'Paste data']}
          tabIndex={6}
        >
          <TabPanel id="panLoadFromJira">
            <FormLoadFromJira
              url={url}
              setUrl={setUrl}
              passProjectData={props.passProjectData}
              handleModalClose={props.handleModalClose}
            />
          </TabPanel>
          <TabPanel id="panPaste">
            <FormPaste
              url={url}
              setUrl={setUrl}
              passProjectData={props.passProjectData}
              handleModalClose={props.handleModalClose}
            />
          </TabPanel>
        </TabbedPanels>
      </Modal>
    );
  } else {
    return null;
  }
} // Modal

function FormLoadFromJira(props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [corsProxy, setCorsProxy] = useState();
  const [localCorsProxyPort, setLocalCorsProxyPort] = useState(8080);
  const [availableBoards, setAvailableBoards] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    props.handleModalClose();
  };

  const handleNext = successCallback => {
    setLoading(true);
    const shavedUrl = props.url.replace(/\/$/, '');

    getBoardsFromJira(
      shavedUrl,
      userId,
      password,
      corsProxy,
      localCorsProxyPort
    )
      .then(boards => {
        const newAvailableBoards = [];
        const newSuggestions = [];
        boards.forEach(board => {
          let boardNameAndId = board.name + ' (' + board.id + ')';
          newAvailableBoards.push({ id: board.id, name: boardNameAndId });
          newSuggestions.push(boardNameAndId);
        });

        setAvailableBoards(newAvailableBoards);
        setSuggestions(newSuggestions);
        successCallback();
        setLoading(false);
      })
      .catch(error => {
        alert(error);
        setLoading(false);
      });
    return false;
  };

  const handleBoardChange = value => {
    const newSelectedBoard = availableBoards.find(
      board => board.name === value
    );
    setSelectedBoard(newSelectedBoard);
  };

  const handleGo = () => {
    setLoading(true);

    getProjectDataFromJira(
      props.url,
      userId,
      password,
      selectedBoard.id,
      corsProxy,
      localCorsProxyPort
    )
      .then(projectData => {
        // Call the callback given in props to pass project data to App
        if (projectData !== {}) {
          props.passProjectData(projectData);
        } else {
          alert('Reading of project data failed');
        }

        setLoading(false);
        props.handleModalClose();
      })
      .catch(error => {
        alert(error);
        setLoading(false);
      });
  };

  return (
    <MultiPageForm>
      <FormPage
        forwardButton={{
          label: 'Next',
          onClick: handleNext,
          disabled: props.url === '' || userId === '' || loading === true,
          showSpinner: loading,
        }}
        backwardButton={{ label: 'Cancel', onClick: handleCancel }}
        header="Enter Jira login details"
      >
        <TextInput
          tabIndex={7}
          type="text"
          id="inpUrl"
          name="url"
          required={true}
          label="Server URL"
          placeholder="Enter Jira server URL"
          value={props.url}
          onChange={event => {
            props.setUrl(event.target.value);
          }}
          autoComplete="url"
        />
        <RadioGroup
          tabIndex={8}
          id={'corsSelection'}
          name="corsProxy"
          label="CORS proxy"
          value={corsProxy}
          choices={[
            { value: 'heroku', label: 'Heroku' },
            { value: 'localhost', label: 'Local workstation' },
            { value: 'none', label: 'None' },
          ]}
          updateValue={value => setCorsProxy(value)}
        />
        <TextInput
          tabIndex={9}
          type="text"
          id="inpUserId"
          name="userId"
          required={true}
          label="User ID"
          value={userId}
          onChange={event => {
            setUserId(event.target.value);
          }}
          autoComplete="username"
        />
        <TextInput
          tabIndex={10}
          type="password"
          id="inpPassword"
          name="password"
          required={true}
          label="Password or API Token"
          value={password}
          onChange={event => {
            setPassword(event.target.value);
          }}
          autoComplete="current-password"
        />{' '}
      </FormPage>
      <FormPage
        forwardButton={{
          label: 'Go',
          onClick: handleGo,
          disabled: !selectedBoard,
          showSpinner: loading,
        }}
        backwardButton={{ label: 'Back' }}
        header="Select a board from Jira"
      >
        <Autocomplete
          tabIndex={13}
          label="Board"
          placeholder="Select board..."
          onValueChange={handleBoardChange}
          suggestions={suggestions}
        />
      </FormPage>
    </MultiPageForm>
  );
}

function FormPaste(props) {
  const [boardName, setBoardName] = useState('');
  const [boardId, setBoardId] = useState('');
  const [filterId, setFilterId] = useState('');
  const [pages, setPages] = useState('?');
  const [maxResults, setMaxResults] = useState(1000);
  const [pastedBoardData, setPastedBoardData] = useState('');
  const [parsedBoardData, setParsedBoardData] = useState(undefined);
  const [pastedIssueData, setPastedIssueData] = useState('');
  const [parsedIssueData, setParsedIssueData] = useState(undefined);

  const onBoardTextAreaChange = (event, index) => {
    setPastedBoardData(event.target.value);
    let newParsedBoardData = undefined;

    try {
      newParsedBoardData = JSON.parse(event.target.value);
    } catch (error) {
      console.log(error);
    }

    setParsedBoardData(newParsedBoardData);
  };

  const onIssueTextAreaChange = (event, index) => {
    const clonedEvent = { ...event };

    setPastedIssueData(prevState => {
      if (clonedEvent.target) {
        return { ...prevState, [index]: clonedEvent.target.value };
      } else {
        return { ...prevState };
      }
    });

    let actualMaxResults = maxResults;
    let totalIssues = 0;
    let issues = undefined;

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
          {2 + (page - 1) * 2}. Access and copy issue data from Jira Rest API
          (page {page}/{props.pages})
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
            onIssueTextAreaChange(event, page);
          }}
        />
      );
    }
    return linksAndTextAreas;
  }

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
        forwardButton={{
          label: 'Next',
          disabled: parsedBoardData === undefined,
        }}
        backwardButton={{ label: 'Cancel', onClick: handleCancel }}
        header="Paste board data from Jira REST API"
      >
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={7}
        >
          1. Log in to Jira
        </a>
        <TextInput
          tabIndex={8}
          type="text"
          name="url"
          label="2. Enter Jira server URL"
          placeholder="2. Enter Jira server URL"
          value={props.url}
          onChange={props.setUrl}
        />
        <TextInput
          tabIndex={9}
          type="text"
          name="boardName"
          label="3. Enter name of Jira board"
          placeholder="3. Enter name of Jira board"
          value={boardName}
          onChange={e => {
            setBoardName(e.target.value);
          }}
        />
        <a
          href={getBoardsUrl(props.url, boardName)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={10}
        >
          4. Look up ID of board from Jira Rest API
        </a>
        <TextInput
          tabIndex={11}
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
          tabIndex={12}
        >
          6. Access and copy board data from Jira Rest API
        </a>

        <textarea
          tabIndex={13}
          name="boardData"
          wrap="soft"
          value={pastedBoardData}
          placeholder={'7. Paste board data'}
          onChange={onBoardTextAreaChange}
        />
      </FormPage>
      <FormPage
        forwardButton={{
          label: 'Go',
          onClick: handleGo,
          disabled: parsedIssueData === undefined,
        }}
        backwardButton={{ label: 'Back' }}
        header="Paste issue data from Jira REST API"
      >
        <TextInput
          tabIndex={14}
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
          tabIndex={15}
          url={props.url}
          filterId={filterId}
          pages={pages}
          maxResults={maxResults}
        />
      </FormPage>
    </MultiPageForm>
  );
}
