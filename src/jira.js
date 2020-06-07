/**
 * @module src/jira
 * @description Contains functions for retrieving
 * [boards]{@link module:src/jira#getBoardsFromJira},
 * [board configurations]{@link module:src/jira#getBoardFromJira},
 *and [issues]{@link module:src/jira#getIssuesFromJira}  from the Jira REST API.
 */

/**
 * Namespace encapsulating the functions
 * [getBoardsFromJira]{@link module:src/jira#getBoardsFromJira},
 * [getBoardFromJira]{@link module:src/jira#getBoardFromJira} and
 * [getIssuesFromJira]{@link module:src/jira#getIssuesFromJira}
 */

/**
 * @method getBoardsFromJira
 * @instance
 * @description Retrieve from the Jira REST API the list of Jira boards that
 * the user has access to.
 * @param serverUrl Url to the Jira server (including possible cors proxy)
 * given by the user
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 */
export const getBoardsFromJira = (
  serverUrl,
  id,
  token,
  corsProxy,
  localCorsProxyPort
) => {
  const BOARDS_PATH = '/rest/agile/1.0/board';
  const boardsUrl = serverUrl + BOARDS_PATH;
  // const boardsPromise = fetchFromJira(boardsUrl, id, token, {});

  const parameters = {
    startAt: 0,
    maxResults: 500,
  };

  const boardsPromise = recursiveFetchFromJira(
    boardsUrl,
    id,
    token,
    parameters,
    0, // startAt
    'values', // fieldName
    [], // values
    corsProxy,
    localCorsProxyPort
  );

  return boardsPromise;
};

/**
 * @method getProjectDataFromJira
 * @instance
 * @description Retrieve from the Jira REST API board information and isses
 *  for a given board that the user has access to.
 * @param serverUrl Url to the Jira server (including possible cors proxy)
 * given by the user
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param boardId Id of the Jira board that the user selected to retrieve data for
 */
export const getProjectDataFromJira = (
  serverUrl,
  id,
  token,
  boardId,
  corsProxy,
  localCorsProxyPort
) => {
  return new Promise((resolve, reject) => {
    const projectData = {};
    getBoardFromJira(
      serverUrl,
      id,
      token,
      boardId,
      corsProxy,
      localCorsProxyPort
    ).then(boardConf => {
      projectData.boardConf = boardConf;
      getIssuesFromJira(
        serverUrl,
        id,
        token,
        boardConf.filter.id,
        corsProxy,
        localCorsProxyPort
      ).then(issues => {
        projectData.issues = issues;
        resolve(projectData);
      });
    });
  });
};

/**
 * @method getBoardFromJira
 * @instance
 * @description Retrieve from the Jira REST API the configuration of the
 * board defined by the boardId parameter
 * @param serverUrl Url to the Jira server (including possible cors proxy)
 * given by the user
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param boardId Jira id of the board whose configuration is to be retrieved
 */
function getBoardFromJira(
  serverUrl,
  id,
  token,
  boardId,
  corsProxy,
  localCorsProxyPort
) {
  const boardConfigurationUrl =
    serverUrl + '/rest/agile/1.0/board/' + boardId + '/configuration';
  // const boardConfPromise = fetchFromJira(boardConfigurationUrl, id, token, {});
  const boardConfPromise = fetchFromServer(
    boardConfigurationUrl,
    id,
    token,
    {},
    corsProxy,
    localCorsProxyPort
  );

  return boardConfPromise;
}

/**
 * @method getIssuesFromJira
 * @instance
 * @description Retrieve from the Jira REST API the details of the issues
 * matching the filter specified by the filterId parameter
 * @param serverUrl Url to the Jira server (including possible cors proxy)
 * given by the user
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param filterId Jira id of the filter to be used for querying issues
 */
function getIssuesFromJira(
  serverUrl,
  id,
  token,
  filterID,
  corsProxy,
  localCorsProxyPort
) {
  const issuesUrl = serverUrl + '/rest/api/2/search';

  const parameters = {
    jql: 'filter = ' + filterID,
    startAt: 100,
    maxResults: 500,
    fields: ['key', 'summary', 'created', 'status', 'assignee'],
    expand: 'changelog',
  };

  const issuesPromise = recursiveFetchFromJira(
    issuesUrl,
    id,
    token,
    parameters,
    0, // startAt
    'issues', // fieldName
    [], // values
    corsProxy,
    localCorsProxyPort
  );

  return issuesPromise;
}

/****************************************************************************
                          recursiveFetchFromJira
 ****************************************************************************/

/**
 * @method recursiveFetchFromJira
 * @description Recursive function making multiple requests to the Jira REST API
 * to fetch a complete list of items in situations where each request only
 * retrieves a subset of all items.
 * @param ul Url to the Jira REST API resource (including possible cors proxy url)
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param parameters Possible parameters to be included in the HTTP request
 * @param startAt The index of the first item to be retrieved
 * @param fieldName The name of the field in the response JSON that contains the
 * list of the items that we want to retrieve. This can be different for
 * different API resources, e.g. when retrieving boards, the field is called
 * "values" but when retrieving issues, the field is called "issues".
 * @param values Holds the list of items retrieved through the calls to the API.
 * This list is passed as a parameter and added to in each subsequent API call.
 */
function recursiveFetchFromJira(
  url,
  id,
  token,
  parameters,
  startAt,
  fieldName,
  values,
  corsProxy,
  localCorsProxyPort
) {
  parameters['startAt'] = startAt;

  // const valuesPromise = fetchFromJira(url, id, token, parameters).then(
  const valuesPromise = fetchFromServer(
    url,
    id,
    token,
    parameters,
    corsProxy,
    localCorsProxyPort
  ).then(response => {
    if (response[fieldName].length > 0) {
      return recursiveFetchFromJira(
        url,
        id,
        token,
        parameters,
        response['startAt'] + response[fieldName].length,
        fieldName,
        values.concat(response[fieldName]),
        corsProxy,
        localCorsProxyPort
      );
    } else {
      return values;
    }
  });
  return valuesPromise;
}

/****************************************************************************
                              fetchFromJira
 ****************************************************************************/

/**
 * @method fetchFromJira
 * @description Makes a call to the given Jira REST API and passes on the
 * response to the calling function in the form of a promise
 * @param ul Url to the Jira REST API resource (including possible cors proxy url)
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param parameters Possible parameters to be included in the HTTP request
 */
/*
function fetchFromJira(url, id, token, parameters) {
  const authorizationString = 'Basic ' + btoa(id + ':' + token);
  const options = {
    method: 'GET',
    headers: {
      Authorization: authorizationString,
      'Content-Type': 'application/json',
    },
  };

  if (parameters) {
    url = url + '?' + serialize(parameters);
  }

  const resultPromise = fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .catch(error => {
      alert(error);
    });
  return resultPromise;
}*

/**
 * @function serialize
 * @description Converts a JavaScript object with HTTP request parameters into
 * a serialized string that can be appended to the url
 * @param obj JavaScript object with HTTP request parameters to be serialized
 */
function serialize(obj) {
  let str = Object.keys(obj)
    .reduce((a, k) => {
      a.push(k + '=' + encodeURIComponent(obj[k]));
      return a;
    }, [])
    .join('&');
  return str;
}

/****************************************************************************
                              fetchFromServer
 ****************************************************************************/

/**
 * @method fetchFromServer
 * @description Makes a call to the given Jira REST API through a proxy on the
 * local node.js server and passes on the
 * response to the calling function in the form of a promise
 * @param ul Url to the Jira REST API resource (including possible cors proxy url)
 * @param id User id for logging to the Jira server, given by user
 * @param token Password or API token for logging to the Jira server, given by user
 * @param parameters Possible parameters to be included in the HTTP request
 */

function fetchFromServer(
  jiraUrl,
  jiraId,
  jiraToken,
  jiraParameters,
  corsProxy,
  localCorsProxyPort
) {
  let serverUrl = '';
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (corsProxy === 'heroku') {
    const parameters = {
      url: jiraUrl,
      id: jiraId,
      token: jiraToken,
      ...jiraParameters,
    };
    serverUrl = 'boards?' + serialize(parameters);
  } else {
    const authorizationString = 'Basic ' + btoa(jiraId + ':' + jiraToken);
    options.headers.Authorization = authorizationString;
    serverUrl = jiraUrl;
    if (corsProxy === 'local') {
      serverUrl = 'http://127.0.0.1:' + localCorsProxyPort + '/' + serverUrl;
    }
    if (jiraParameters) {
      serverUrl = serverUrl + '?' + serialize(jiraParameters);
    }
  }

  const resultPromise = fetch(serverUrl, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .catch(error => {
      alert(error);
    });
  return resultPromise;
}
