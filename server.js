import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
const PORT = 8000;

const server = http.createServer((req, res) => {
    // console.log(req.url)
    // console.log(req.method)

    res.writeHead(200, {'content-Type': 'text/html'});
    res.end('<h1>Hello World!</h1>');
});

server.listen(PORT,() =>{
   console.log(`server running on port ${PORT}`);
});



