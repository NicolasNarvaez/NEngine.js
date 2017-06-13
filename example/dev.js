var cfg = require('./cfg.js'),
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express()


app.use(bodyParser.json())

app.use(function(req, res, next) {
	console.log('processing a request')
	//console.dir(req, {depth:1})
	next()
});

['doc', 'lib', 'dist'].forEach((e) => {
	app.use('/'+e, express.static(__dirname+'/../'+e))
})
app.use('/example/', express.static(__dirname+'/ngrid/'))


var server = app.listen(cfg.port)
// console.log(server)
console.log("running in "+cfg.port)
