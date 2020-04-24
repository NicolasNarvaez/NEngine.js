var cfg = require('./cfg.js'),

	//modules
	fs = require('fs'),
	express = require('express'),
	bodyParser = require('body-parser'),

	//server
	app = express(),
	http_server = require('http').Server(app),
	io = require('socket.io')(http_server),

	//pug
	pug_static = require('./pug-static.js'),
	pug_locals = {files: []},
	pug_static_midleware = pug_static({
		src: __dirname+'/expo/',
		html: true,
		locals: pug_locals
	})

/**
/////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Midlewares
/////////////////////////////////////////////////////////////////
*/
app.use(bodyParser.json())

app.use( ( req, res, next) => {
	console.log('processing a request')
	next()
});

/**
/////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// Routing
/////////////////////////////////////////////////////////////////
*/

['doc', 'lib', 'dist', 'assets'].forEach( e =>
	app.use('/'+e, express.static(__dirname+'/../'+e))
)

////////// Expo section

app.use('/example/', pug_static({
	src:__dirname+'/ngrid/',
	locals: pug_locals,
	html: true,
}) )
app.use('/example/', express.static(__dirname+'/ngrid/'))

app.use('/expo/', pug_static_midleware )
app.use('/expo/', express.static(__dirname+'/expo/'))

app.use('/', pug_static_midleware )
app.use('/', express.static(__dirname+'/expo/'))

//each game as a pug_static, the list of
//folders is added to pug_locals.files
fs.readdir(__dirname+'/expo/games/', (err, files) => {

	files = pug_locals.files = files.map( e => {
		return {
			name: e.toUpperCase(),
			href: '/expo/games/'+encodeURI(e)+'/',
		}
	}).reverse()

	files.forEach((f) => {
		app.use( __dirname + f.href, pug_static({
			src: __dirname + f.ref,
			html: true,
			locals: pug_locals
		}) )
	})

	console.log(files);
	while(files.length < 14)
	files.unshift({
		name: '', href: ''
	})
	console.log(__dirname+'/expo/games/',err, files)
})

/**
/////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// start
/////////////////////////////////////////////////////////////////
*/

http_server.listen(cfg.port)

/**
/////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// socket.io handling
/////////////////////////////////////////////////////////////////
*/

var users = {},
	last_user

var last_users = []
	

io.on('connection', sk => {
	console.log('connection', sk.id)
	
	users[sk.id] = sk
	last_user = sk.id
	
	last_users = Object.assign({}, users)
	delete last_users[sk.id]

	sk.on('key', key => {
		var last_users_keys = Object.keys(last_users)
		console.log(
			'keyCode', key.keyCode,
			'code', key.code,
			'key_ev', JSON.stringify(key),
			// 'last_users_keys:', last_users_keys,
			// 'last_user:', last_user
		)
		last_users_keys.forEach( user =>
			io.to(user).emit('key_press', key)
		)
		
	})

	sk.on('log', log_arguments => {
		console.log('####### logging event \n', log_arguments);
	})
})

console.log('running in ' + cfg.port, 'parametters: ', process.argv)
