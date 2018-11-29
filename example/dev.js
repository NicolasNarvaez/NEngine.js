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
			name: e,
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

io.on('connection', sk => {
	// if(last_user)
	// 	io.to(sk.id).emit('set_id', last_user)
	console.log('connecion', sk.id)
	users[sk.id] = sk
	last_user = sk.id

	sk.on('key', key => {
		console.log('event key')
		// console.log('key, users:', users, 'last_user:', last_user)
		if(last_user)
			io.to(last_user).emit('key_press', key)
	})

	sk.on('log', log_arguments => {
		console.log(log_arguments);
		// console.log.apply(console, log_arguments)
	})
})

// console.log(server)
console.log('running in '+cfg.port, 'parametters: ', process.argv)
