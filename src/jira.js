export function getBoardsFromJira(serverUrl, id, token) {
  const BOARDS_PATH = '/rest/agile/1.0/board';
  const boardsUrl = serverUrl + BOARDS_PATH;
  const boardsPromise = fetchFromJira(boardsUrl, id, token);
  return boardsPromise;
}

export function getBoardFromJira(serverUrl, id, token, boardId) {
  const boardConfigurationUrl =
    serverUrl + '/rest/agile/1.0/board/' + boardId + '/configuration';
  const boardConfPromise = fetchFromJira(boardConfigurationUrl, id, token);

  return boardConfPromise;
}

export function getIssuesFromJira(serverUrl, id, token, filterID) {
  const issuesUrl = serverUrl + '/rest/api/2/search';
  const issuesPromise = fetchFromJira(issuesUrl, id, token, {
    jql: 'filter = ' + filterID,
    startAt: 0,
    fields: ['key', 'summary', 'created', 'status', 'assignee'],
    expand: 'changelog',
  }).then(result => result.issues);

  return issuesPromise;
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
