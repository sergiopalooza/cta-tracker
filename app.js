var request = require("request");
var express = require('express');
var dotenv = require('dotenv').config();

var app = express();
var exphbs  = require('express-handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars')

var busOptions = { method: 'GET',
  url: 'http://www.ctabustracker.com/bustime/api/v2/getpredictions',
  qs: 
   { key: process.env.CTA_BUS_KEY,
     rt: process.env.BUS_RT,
     stpid: process.env.BUS_STPID,
     format: 'json' },
  headers: 
   { 'cache-control': 'no-cache',
     'content-type': 'application/json' } 
};

var trainOptions = { method: 'GET',
  url: 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx',
  qs: 
   { key: process.env.CTA_TRAIN_KEY,
     stpid: process.env.TRAIN_STPID,
     max: '2',
     outputType: 'JSON' },
  headers: 
   { 'cache-control': 'no-cache',
     'content-type': 'application/json' } 
};

app.get('/', function (req, res) {
	request(busOptions, function (error, response, body) {
	  if (error) throw new Error(error);

	  var jsonResponse = body;
	  var parsedBody = JSON.parse(body);
	  var busPredictions = parsedBody["bustime-response"].prd;

	  request(trainOptions, function (error, response, body){
	  	var parsedBody = JSON.parse(body);
	  	var etas = parsedBody.ctatt.eta;
	  	var trainPredictions = [];
	  	etas.forEach(function(eta){
	  		var prdtTmpDate = new Date(eta.prdt);
	  		var arrtTmpDate = new Date(eta.arrT);
	  		var etaInMinutes = (arrtTmpDate -  prdtTmpDate)/60000;
	  		trainPredictions.push(etaInMinutes)
	  	});

	  	res.render('home', {
	  		busPredictions: busPredictions,
	  		trainPredictions: trainPredictions,
	  		time: Math.round(+new Date()/1000)
	  	});
	  });
	});
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});