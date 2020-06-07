const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
//const cors = require('cors');
const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/boards', (req, res) => {
  let { url, id, token, ...queryParameters } = req.query;

  const authorizationString =
    'Basic ' + Buffer.from(id + ':' + token).toString('base64');

  if (queryParameters) {
    url = url + '?' + serialize(queryParameters);
  }

  const options = {
    method: 'GET',
    headers: {
      Authorization: authorizationString,
      'Content-Type': 'application/json',
    },
  };

  fetch(url, options)
    .then(response => {
      return response.json();
    })
    .then(json => {
      res.send(JSON.stringify(json));
    })
    .catch(error => {
      console.log(error);
    });
});

app.listen(9001);

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
