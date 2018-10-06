const http = require('http');
const url = require('url');

const server = http.createServer(function(req,res) {
    const urlObj = url.parse(req.url);
    if(urlObj.pathname === '/') {
        res.write('Hello World!');
        res.end();
    }
    else {
        res.write('404 Not found!');
        res.end();
    }

});

server.listen(3000);
