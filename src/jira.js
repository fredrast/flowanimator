export function getBoardsFromJira(serverUrl, id, token) {
  const BOARDS_PATH = '/rest/agile/1.0/board';
  const boardsUrl = serverUrl + BOARDS_PATH;
  console.log('boardsURL: ' + boardsUrl);
  // const boardsPromise = fetchFromJira(boardsUrl, id, token, {});
  const boardsPromise = recursiveFetchFromJira(
    boardsUrl,
    id,
    token,
    {}, // parameters
    0, // startAt
    'values', // fieldName
    [] // values
  );
  console.log(boardsPromise);
  return boardsPromise;
}

export function getBoardFromJira(serverUrl, id, token, boardId) {
  const boardConfigurationUrl =
    serverUrl + '/rest/agile/1.0/board/' + boardId + '/configuration';
  const boardConfPromise = fetchFromJira(boardConfigurationUrl, id, token, {});

  return boardConfPromise;
}

export function getIssuesFromJira(serverUrl, id, token, filterID) {
  const issuesUrl = serverUrl + '/rest/api/2/search';

  const parameters = {
    jql: 'filter = ' + filterID,
    startAt: 100,
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
    [] // values
  ).then(result => result.issues);

  return issuesPromise;
}

/****************************************************************************
                          recursiveFetchFromJira
 ****************************************************************************/

function recursiveFetchFromJira(
  url,
  id,
  token,
  parameters,
  startAt,
  fieldName,
  values
) {
  parameters['startAt'] = startAt;

  valuesPromise = fetchFromJira(issuesUrl, id, token, parameters).then(
    response => {
      if (response[fieldName].length > 0) {
        return recursiveFetchFromJira(
          url,
          id,
          token,
          parameters,
          response[startAt] + response[fieldName].length,
          fieldName,
          values.concat(response[fieldName])
        );
      } else {
        return values;
      }
    }
  );
  return valuesPromise;
}

/****************************************************************************
                              fetchFromJira
 ****************************************************************************/

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

  const result = fetch(url, options)
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
  return result;
}

function serialize(obj) {
  let str = Object.keys(obj)
    .reduce((a, k) => {
      a.push(k + '=' + encodeURIComponent(obj[k]));
      return a;
    }, [])
    .join('&');
  return str;
}
