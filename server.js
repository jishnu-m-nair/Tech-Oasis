const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  // Check if root path is requested
  if (req.url === '/') {
    // Serve a custom response for the root path (e.g., index.html)
    const filePath = path.join(__dirname, 'public', 'index.html'); // Replace with your desired file
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Handle error if index.html is not found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // Read requested file and send response
        const stream = fs.createReadStream(filePath);
        stream.on('error', (error) => {
          console.error('Error reading file:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        });
        stream.on('open', () => {
          // Get file extension for setting content type
          const ext = path.extname(filePath).slice(1);
          let contentType = 'text/plain';
          switch (ext) {
            case 'html':
              contentType = 'text/html';
              break;
            case 'css':
              contentType = 'text/css';
              break;
            case 'js':
              contentType = 'text/javascript';
              break;
            // Add more cases for other file types as needed
          }
          res.writeHead(200, { 'Content-Type': contentType });
          stream.pipe(res);
        });
      }
    });
  } else {
    // Handle other requests as before (use the existing logic from the previous example)
    // ...
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
