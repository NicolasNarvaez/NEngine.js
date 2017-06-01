var cfg = require('./cfg.js'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express();


app.use(bodyParser.json())

app.use(function(req, res, next) {
	console.log('processing a request')
	//console.dir(req, {depth:1})
	next()
})

// app.use('/lib', express.static(__dirname+"/../lib"))
app.use('/doc', express.static(__dirname+"/../doc"))
// app.use('/',  express.static(__dirname+"/full"))


var server = app.listen(cfg.port)
// console.log(server)
console.log("running in "+cfg.port)
