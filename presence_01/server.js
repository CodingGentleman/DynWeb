const http = require('http');
const url = require('url');

const server = http.createServer(function(req,res) {
    const urlObj = url.parse(req.url, true);

    if (urlObj.pathname === '/') {
        res.write('Hello World!');
    }
    else if (urlObj.pathname === '/hello') {
        const nameParam = urlObj.query.name;
        res.write(`

<html>
<head></head>
<body>
    <h1>Hello ${nameParam}!</h1>
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
