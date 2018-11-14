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
	}, {
		rex: /\/\S*\/?/,
		methods: {
			'get': getProfile
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

function getProfile(req, res) {
	fs.readFile('./data'+url.parse(req.url).pathname+'.json', 'utf8', (err, data) => {
        if (err) throw err;
        const fields = JSON.parse(data);
        res.write(loadView('profile')(fields));
        res.end();
    });
}

function get405(req, res) {
	getError(req, res, 405);
}

function getPersist(req, res, slug) {
	res.setHeader('Location', '/'+slug);
    res.statusCode = 303;
	res.write(loadView('persisted')({link:slug}))
	res.end();
}

function postPersist(req, res) {
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields) => {
		fs.writeFile('./data/'+fields.slug+'.json', JSON.stringify(fields), (err) => {
            if(err) throw err;
        	getPersist(req, res, fields.slug);
		});
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
	console.log(parsedUrl.pathname);
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
