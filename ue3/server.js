const url = require('url');
const hbs = require('handlebars');
const formidable = require('formidable');
const util = require('util');
const fs = require('fs');

const routes = [
	{
		rex: /^\/$/,
		methods: {
			'get': getHomepage
		}
	}, {
		rex: /^\/new\/?$/,
		methods: {
			'get': getNew
		}
	}, {
		rex: /^\/persist-data\/?$/,
		methods: {
			'post': postPersist
		}
	}
];

function registerPartial(viewName) {
	fs.readFile('views/'+viewName+'.hbs', 'utf-8', (err, data) => {
		if(err) throw err;
		hbs.registerPartial(viewName, hbs.compile(data));
	});
}

function loadView(viewName) {
	const data = fs.readFileSync('views/'+viewName+'.hbs', 'utf-8');
	return hbs.compile(data);
}

function getHomepage (req, res) {
	res.write(loadView('index')());
	res.end();
}

function getNew(req, res) {
	res.write(loadView('new')());
	res.end();	
}

function get405(req, res) {
	getError(req, res, 405);
}

function postPersist(req, res) {
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields) => {
        res.setHeader('Location', '/uri-to-new-resource');
        res.statusCode = 201;
        res.write(util.inspect(fields));
		res.end();
	});
}
/*
{
	slug: '',
	firstname: '',
	lastname: '',
	description: '',
	links: ['']
} */

function getError (req, res, code) {
	res.statusCode = code;
	res.write(loadView('error')({statusCode:code}));
	res.end();
}

function dispatchRequest (req, res) {
    const parsedUrl = url.parse(req.url);
    const method = req.method.toLowerCase();
    const route = routes.find( route => {
        return route.rex.test(parsedUrl.pathname);
    });

    if (route) {
        const handler = route.methods[method] || get405;
        handler(req, res);
    } else {
        getError(req, res, 404);
    }
}

registerPartial('header');
registerPartial('footer');

require('http').createServer((request, response) => {
	response.setHeader('Content-Type', 'text/html');
	response.statusCode = 200;
	try {
		dispatchRequest(request, response);
	} catch (err) {
		console.log(err)
		getError(request, response, 500);
	}
	// response.end();
}).listen(3000);
