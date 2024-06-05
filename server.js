import http from 'http';
const PORT = 8000;

const server = http.createServer((req, res) => {
    res.end('Hello World!');
});

server.listen(PORT,() =>{
   console.log(`server running on port ${PORT}`);
});



