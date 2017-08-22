var cfg = require('./cfg.js'),
	fs = require('fs'),
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	http_server = require('http').Server(app),
	io = require('socket.io')(http_server),
	pug_static = require('./pug-static.js'),
	pug_locals = {files: []}

app.use(bodyParser.json())
app.use((req, res, next) => {
	console.log('processing a request')
	next()
});



['doc', 'lib', 'dist', 'assets'].forEach( e =>
	app.use('/'+e, express.static(__dirname+'/../'+e))
)



fs.readdir(__dirname+'/expo/games/', (err, files) => {
	pug_locals.files = files.map( e => {
		return {
			name: e,
			href: '/expo/games/'+encodeURI(e)+'/',
		}
	} )
	console.log(__dirname+'/expo/games/',err, files, pug_locals.files)

})
app.use('/example/', express.static(__dirname+'/ngrid/'))
app.use('/expo/', pug_static({
	src: __dirname+'/expo/',
	html: true,
	locals: pug_locals
}) )
app.use('/expo/', express.static(__dirname+'/expo/'))



app.use('/save/', (req, res, next) => {
})
http_server.listen(cfg.port)
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
