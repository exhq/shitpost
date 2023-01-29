const http = require('http');

const hostname = '127.0.0.1';
const port = 8045;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    if (req.url.endsWith(".mp4")){
        res.end(`<video src="./files/${req.url.replace("/","")}></video>`);
    } else{    
        res.end('you\'re not supposed to be here.');
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

