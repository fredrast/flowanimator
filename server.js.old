/**
 * @file Defines main server process run by node.
 * Creates a http server that serves the html, js, css and assets
 * that make up the Flow Animator app.
 */

var http = require('http');
var fs = require('fs');

const PORT = process.env.PORT || 8080;

fs.readFile('./index.html', function(err, html) {
  if (err) throw err;

  http
    .createServer(function(request, response) {
      const requestedFile = request.url == '/' ? 'index.html' : request.url;
      fs.readFile('./' + requestedFile, function(err, data) {
        if (!err) {
          var dotoffset = requestedFile.lastIndexOf('.');
          var mimetype =
            dotoffset == -1
              ? 'text/plain'
              : {
                  '.html': 'text/html',
                  '.ico': 'image/x-icon',
                  '.jpg': 'image/jpeg',
                  '.png': 'image/png',
                  '.gif': 'image/gif',
                  '.css': 'text/css',
                  '.js': 'text/javascript',
                  '.map': 'text/javascript',
                }[requestedFile.substr(dotoffset)];
          /* console.log(requestedFile, mimetype); */
          response.setHeader('Content-type', mimetype);
          response.end(data);
        } else {
          /* console.log('file not found: ' + request.url); */
          response.writeHead(404, 'Not Found');
          response.end();
        }
      });
    })
    .listen(PORT);
  /* console.log('Listening on port ' + PORT); */
});
