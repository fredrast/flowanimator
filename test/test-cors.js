function fetchFromJiraCORS(url, id, token) {
  const authorizationString = 'Basic ' + btoa(id + ':' + token);
  const options = {
    method: 'GET',
    headers: {
      Authorization: authorizationString,
      'Content-Type': 'application/json',
    },
  };
  const corsUrl = 'http://localhost:8080/' + url;
  fetch(corsUrl, options)
    .then(
      response => {
        if (response.ok) {
          return response.json();
        } else {
          console.log('Response not OK, logging the response');
          console.log(response);
          throw new Error(response);
        }
      },
      error => {
        console.log('Error, logging the response');
        console.log(error);
        throw new Error(error);
      }
    )
    .then(json => {
      console.log(json);
    })
    .catch(error => alert(error));
}

fetchFromJiraCORS(
  'https://fredrikastrom.atlassian.net/rest/api/latest/issue/10000',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // successful

fetchFromJiraCORS(
  'https://fredrikastrom.atlassian.net/rest/agile/latest/board',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // fails
