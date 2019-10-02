export function getBoardsFromJira(serverUrl, id, token) {
  const BOARDS_PATH = '/rest/agile/1.0/board';
  const boardsUrl = serverUrl + BOARDS_PATH;
  const boardsPromise = fetchFromJira(boardsUrl, id, token);
  return boardsPromise;

  // const boardsJSON = {
  //   maxResults: 50,
  //   startAt: 0,
  //   total: 4,
  //   isLast: true,
  //   values: [
  //     {
  //       id: 1,
  //       self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/1',
  //       name: 'FAT board',
  //       type: 'kanban',
  //       location: {
  //         projectId: 10000,
  //         displayName: 'FATEST (FAT)',
  //         projectName: 'FATEST',
  //         projectKey: 'FAT',
  //         projectTypeKey: 'software',
  //         avatarURI:
  //           '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
  //         name: 'FATEST (FAT)',
  //       },
  //     },
  //     {
  //       id: 2,
  //       self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/2',
  //       name: 'FATEST board',
  //       type: 'kanban',
  //       location: {
  //         projectId: 10000,
  //         displayName: 'FATEST (FAT)',
  //         projectName: 'FATEST',
  //         projectKey: 'FAT',
  //         projectTypeKey: 'software',
  //         avatarURI:
  //           '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
  //         name: 'FATEST (FAT)',
  //       },
  //     },
  //     {
  //       id: 3,
  //       self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/2',
  //       name: 'FATEST board 2',
  //       type: 'kanban',
  //       location: {
  //         projectId: 10000,
  //         displayName: 'FATEST (FAT)',
  //         projectName: 'FATEST',
  //         projectKey: 'FAT',
  //         projectTypeKey: 'software',
  //         avatarURI:
  //           '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
  //         name: 'FATEST (FAT)',
  //       },
  //     },
  //     {
  //       id: 4,
  //       self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/2',
  //       name: 'SCRUM board',
  //       type: 'kanban',
  //       location: {
  //         projectId: 10000,
  //         displayName: 'FATEST (FAT)',
  //         projectName: 'FATEST',
  //         projectKey: 'FAT',
  //         projectTypeKey: 'software',
  //         avatarURI:
  //           '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
  //         name: 'FATEST (FAT)',
  //       },
  //     },
  //   ],
  // };

  // /* console.log(boardsJSON); */
  //
  // return boards;
}

export function getBoardFromJira(serverUrl, id, token, boardId) {
  const boardConfigurationUrl =
    serverUrl + '/rest/agile/1.0/board/' + boardId + '/configuration';

  const boardConfPromise = fetchFromJira(boardConfigurationUrl, id, token);

  // const boardConfPromise = new Promise(function(resolve, reject) {
  //   const boardConf = new Object({
  //     id: 2,
  //     name: 'FATEST board',
  //     type: 'kanban',
  //     self:
  //       'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/2/configuration',
  //     location: {
  //       type: 'project',
  //       key: 'FAT',
  //       id: '10000',
  //       self: 'https://fredrikastrom.atlassian.net/rest/api/2/project/10000',
  //       name: 'FATEST',
  //     },
  //     filter: {
  //       id: '10001',
  //       self: 'https://fredrikastrom.atlassian.net/rest/api/2/filter/10001',
  //     },
  //     subQuery: {
  //       query: 'fixVersion in unreleasedVersions() OR fixVersion is EMPTY',
  //     },
  //     columnConfig: {
  //       columns: [
  //         { name: 'Backlog', statuses: [] },
  //         {
  //           name: 'To Do',
  //           statuses: [
  //             {
  //               id: '10001',
  //               self:
  //                 'https://fredrikastrom.atlassian.net/rest/api/2/status/10001',
  //             },
  //             {
  //               id: '10000',
  //               self:
  //                 'https://fredrikastrom.atlassian.net/rest/api/2/status/10000',
  //             },
  //           ],
  //         },
  //         {
  //           name: 'In Progress',
  //           statuses: [
  //             {
  //               id: '3',
  //               self: 'https://fredrikastrom.atlassian.net/rest/api/2/status/3',
  //             },
  //           ],
  //         },
  //         {
  //           name: 'Done',
  //           statuses: [
  //             {
  //               id: '10002',
  //               self:
  //                 'https://fredrikastrom.atlassian.net/rest/api/2/status/10002',
  //             },
  //           ],
  //         },
  //       ],
  //       constraintType: 'issueCount',
  //     },
  //     ranking: { rankCustomFieldId: 10019 },
  //   });
  //
  //   resolve(boardConf);
  // });

  return boardConfPromise;
}

export function getIssuesFromJira(serverUrl, id, token, filterID) {
  const issuesPromise = fetchFromJira(
    'https://fredrikastrom.atlassian.net/rest/api/2/search',
    'fma@iki.fi',
    'px969wSEJ1oVFULg7UnlFFB8',
    {
      jql: 'filter = 10001',
      startAt: 0,
      fields: ['key', 'summary', 'created', 'status', 'assignee'],
      expand: 'changelog',
    }
  ).then(result => result.issues);

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
  let str =
    '?' +
    Object.keys(obj)
      .reduce((a, k) => {
        a.push(k + '=' + encodeURIComponent(obj[k]));
        return a;
      }, [])
      .join('&');
  return str;
}
