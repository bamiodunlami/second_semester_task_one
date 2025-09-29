const http = require('http');
const fs = require('fs');
const path = require('path');

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      //check GET request and the path

      const filePath = path.join(__dirname, 'public', 'index.html');
      
      fs.readFile(filePath, function (err, html) {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.write('Error reading index.html');
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(html);
          res.end();
        }
      });
      return;
    }
  })
  .listen(3000, () => {
    console.log('Server running at localhost:3000/');
  });
