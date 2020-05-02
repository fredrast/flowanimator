function fetchFromJira(url, id, token) {
  const authorizationString = 'Basic ' + btoa(id + ':' + token);
  const options = {
    method: 'GET',
    // mode: 'no-cors',

    headers: {
      Authorization: authorizationString,
      // accept: 'text/plain',
      // 'Access-Control-Request-Method': 'GET',
      // 'Access-Control-Request-Headers': 'X-Custom-Header',
      // 'cache-control': 'no-cache',
      // pragma: 'no-cache',
      // 'Content-Type': 'application/xml',
      'Content-Type': 'application/json',
      // 'Content-Type': 'text/plain',
    },
  };

  fetch(url, options)
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

fetchFromJira(
  'https://fredrikastrom.atlassian.net/rest/api/latest/issue/10000',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // successful

fetchFromJira(
  'https://fredrikastrom.atlassian.net/rest/agile/latest/board',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // fails

/* function fetchFromJira(url, id, token, parameters) {
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

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then(json => {
      console.log(json);
    })
    .catch(error => {
      console.log(error);
    });
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

fetchFromJira(
  'https://fredrikastrom.atlassian.net/rest/api/2/search',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8',
  {
    jql: 'filter = 10001',
    startAt: 0,
    fields: ['key', 'summary', 'created', 'status', 'assignee'],
    expand: 'changelog',
  }
); // successful

/*

fetchFromJira(
  'https://fredrikastrom.atlassian.net/rest/api/latest/issue/10000',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // successful

fetchFromJira(
  'https://fredrikastrom.atlassian.net/rest/agile/1.0/board',
  'fma@iki.fi',
  'px969wSEJ1oVFULg7UnlFFB8'
); // fails

/*
const username = 'fma@iki.fi';
const password = 'px969wSEJ1oVFULg7UnlFFB8';

function getRest() {
  $.ajax({
    type: 'GET',
    url: 'https://fredrikastrom.atlassian.net/rest/api/latest/issue/FAT-1',
    // url: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board',
    dataType: 'json',

    beforeSend: function(xhr) {
      xhr.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(username + ':' + password)
      );
    },
    success: function(data) {
      console.log(data);
    },
  });
}

getRest();



/*const readStoriesAndTransitionsFromJIRA = (url, id, token) => {
  const authorizationString = btoa(id + ':' + token);
  const options = {
    method: 'GET',
    headers: {
      Authorization: authorizationString,
      'Content-Type': 'application/json',
    },
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        console.log('Result was OK!');
        return response.json();
      } else {
        throw new Error(
          'Result was NOT OK: ' + response.status + ' ' + response.statusText
        );
      }
    })
    .then(json => {
      console.log(SON.stringify(json));
    })
    .catch(error => {
      alert(error);
    });
};

var demo1 = new autoComplete({
  selector: '#hero-demo',
  minChars: 1,
  source: function(term, suggest) {
    term = term.toLowerCase();
    var choices = [
      'ActionScript',
      'AppleScript',
      'Asp',
      'Assembly',
      'BASIC',
      'Batch',
      'C',
      'C++',
      'CSS',
      'Clojure',
      'COBOL',
      'ColdFusion',
      'Erlang',
      'Fortran',
      'Groovy',
      'Haskell',
      'HTML',
      'Java',
      'JavaScript',
      'Lisp',
      'Perl',
      'PHP',
      'PowerShell',
      'Python',
      'Ruby',
      'Scala',
      'Scheme',
      'SQL',
      'TeX',
      'XML',
    ];
    var suggestions = [];
    for (i = 0; i < choices.length; i++)
      if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
    suggest(suggestions);
  },
});

/*

async function fetchAPI() {
  let response = await fetch(
    // 'http://dummy.restapiexample.com/api/v1/employees'
    // 'https://fredrikastrom.atlassian.net/rest/api/3/search?jql=project%20%3D%20FATEST',
    // 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board',
    // 'https://fredrikastrom.atlassian.net/rest/agile/1.0/issue/FAT-1',
    'https://fredrikastrom.atlassian.net/rest/api/3/issue/FAT-1',
    {
      method: 'GET',
      // mode: 'cors',
      // credentials: 'include',

      headers: {
        Authorization: 'Basic Zm1hQGlraS5maTpweDk2OXdTRUoxb1ZGVUxnN1VubEZGQjg=',
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Credentials': true,
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'GET',
        // 'Access-Control-Allow-Headers': 'application/json',

        // Origin: '127.0.0.1:8080',
      },
    }
  );
  let json = await response.json();
  console.log(json);
}

// fetchAPI();

function successCallback1(response) {
  console.log('Success!');
  console.log('Heres the result: ');
  console.log(response);
  console.log(response.ok);
  if (response.ok) {
    console.log('Result was OK!');
    return response.json();
  } else {
    throw new Error(
      'Result was NOT OK: ' + response.status + ' ' + response.statusText
    );
  }
}

function successCallback2(json) {
  console.log(JSON.stringify(json));
  console.log('Ran until the end!!!');
}

function errorCallback(error) {
  console.log('Error!');
  console.log('Heres the error: ');
  console.log(error);
  return error;
}

const readFromAPI = () => {
  fetch('https://fredrikastrom.atlassian.net/rest/api/3/issue/FAT-1', {
    method: 'GET',
    // mode: 'cors',
    // credentials: 'include',
    headers: {
      Authorization: 'Basic Zm1hQGlraS5maTpweDk2OXdTRUoxb1ZGVUxnN1VubEZGQjg=',
      'Content-Type': 'application/json',
    },
  })
    .then(successCallback1)
    .then(successCallback2)
    .catch(errorCallback);
};

readFromAPI();

console.log('Base64 encoding:');
console.log(btoa('fma@iki.fi:px969wSEJ1oVFULg7UnlFFB8'));
console.log(atob('Zm1hQGlraS5maTpweDk2OXdTRUoxb1ZGVUxnN1VubEZGQjg='));

//   response => {
//     if (response.ok) {
//       return response.json();
//     }
//     // throw new Error('Network response was not ok.');
//   },
//   error => {
//     console.log(error);
//   }
// )

// .catch(error => {
//   console.log('Caught an error:');
//   console.log(error);
//   console.log('What will happen next?');
// })
// };

// readFromAPI();

// for (var i = 0; i < 10000; i++) {
//   console.log('One more loop!');
// }
console.log('Execution continues!');

const boards = new Object({
  maxResults: 50,
  startAt: 0,
  total: 2,
  isLast: true,
  values: [
    {
      id: 1,
      self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/1',
      name: 'FAT board',
      type: 'kanban',
      location: {
        projectId: 10000,
        displayName: 'FATEST (FAT)',
        projectName: 'FATEST',
        projectKey: 'FAT',
        projectTypeKey: 'software',
        avatarURI:
          '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
        name: 'FATEST (FAT)',
      },
    },
    {
      id: 2,
      self: 'https://fredrikastrom.atlassian.net/rest/agile/1.0/board/2',
      name: 'FATEST board',
      type: 'kanban',
      location: {
        projectId: 10000,
        displayName: 'FATEST (FAT)',
        projectName: 'FATEST',
        projectKey: 'FAT',
        projectTypeKey: 'software',
        avatarURI:
          '/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10406',
        name: 'FATEST (FAT)',
      },
    },
  ],
});

// console.log(boards);

var buttons = document.getElementById('buttons').getElementsByTagName('button');
// console.log(buttons);

/* const CALENDAR_DAY_IN_MS = 86400000;

function msToTime1(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}

function msToTime(duration) {
  // thanks to https://coderwall.com/p/wkdefg/converting-milliseconds-to-hh-mm-ss-mmm
  var milliseconds = parseInt(duration % 1000),
    seconds = parseInt(duration / 1000) % 60,
    minutes = parseInt(duration / (1000 * 60)) % 60,
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

const aDate = new Date(
  2 * CALENDAR_DAY_IN_MS + (3 * 60 * 60 + 3 * 60 + 3) * 1000 + 3333
);
console.log(aDate);
console.log(msToTime1(aDate.getTime()));
console.log(msToTime2(aDate.getTime()));

/*
function MyClass(foo, bar) {
  this.foo = foo;
  this.bar = bar;
  this.width = MyClass.settings.width;
}

MyClass.settings = { width: 10, height: 20 };

const object1 = new MyClass('lorem', 'ipsum');
// object1.settings = { width: 30, height: 40 };
const object2 = new MyClass('solor', 'dit');

console.log(object1);
console.log(object2.settings);
console.log(object2.width);

/*
const canvas = SVG('svg');
canvas.size(window.innerWidth, window.innerHeight);
const background = canvas.rect('100%', '100%').fill('#97F9F9');

const text = canvas.text('Lorem ipsum');
text.text('New text');
text.move(200, 200);
text.font({
  family: 'Helvetica',
  size: 16,
  anchor: 'right',
  leading: '1.5em',
});

console.log(text.bbox());
console.log(text);
const textWidth = text.node.textLength.baseVal.value;

const rect = canvas.rect(textWidth, textWidth);
rect.move(200, 200);
rect.fill({ color: '#f06', opacity: 0.2 });

const coordsText = canvas.text('');

coordsText.move(canvas.viewbox().x + 10, canvas.viewbox().y + 10);
coordsText.font({
  family: 'Helvetica',
  size: 10,
  anchor: 'right',
  leading: '1.5em',
});

canvas.on('mousemove', e => {
  coordsText.clear();
  coordsText.text(
    'client x: ' +
      e.clientX +
      '\n' +
      'client y: ' +
      e.clientY +
      '\n' +
      'viewbox x: ' +
      (e.clientX + canvas.viewbox().x) +
      '\n' +
      'viewbox y: ' +
      (e.clientY + canvas.viewbox().y)
  );
  //
});

var str;
console.log('str:');
console.log(str);
if (!str) console.log('Str not defined');

str = 'Lorem ipsum';
var x;
console.log(str.substring(0, x) + str.substring(x, str.length));
*/
