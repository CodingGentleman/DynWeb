const http = require('http');
const url = require('url');

const server = http.createServer(function(req,res) {
    const urlObj = url.parse(req.url);
    if (urlObj.pathname === '/') {
        res.write('Hello World!');
    }
    else if (urlObj.pathname === '/hello') {
        res.write(`

<html>
<head></head>
<body>
    <h1>Hello!</h1>
</body>
</html>

`);
    }
    else {
        res.statusCode = 404;
        res.write('404 Not found!');
    }
    res.end();
});

server.listen(3000);
