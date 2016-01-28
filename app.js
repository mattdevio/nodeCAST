var http = require('http');
var fs = require('fs');
var path = require('path');
// Load my custom modules :)
var geocodeplus = require('geocodeplus');
var forecastioplus = require('forecastioplus');

// Instantiate new forecast object
var forecast = new forecastioplus.Forecast("c4b7005e56931d754111754522dce3ec");

http.createServer(function(req, res){

	// Log req Method
	console.log(`${req.method} request for ${req.url}`);

	// Serve html, js, css and img
	if ( req.url === "/" ){
		fs.readFile("./public/index.html", "UTF-8", function(err, html){
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(html);
		});
	} else if ( req.url.match(/.css$/) ){
		var cssPath = path.join(__dirname, 'public', req.url);
		var fileStream = fs.createReadStream(cssPath, "UTF-8");
		res.writeHead(200, {"Content-Type": "text/css"});
		fileStream.pipe(res);
	} else if ( req.url.match(/.js$/) ){
		var jsPath = path.join(__dirname, 'public', req.url);
		var fileStream = fs.createReadStream(jsPath, "UTF-8");
		res.writeHead(200, {"Content-Type": "text/js"});
		fileStream.pipe(res);

	} else if ( req.url.match(/.ico$/) ){
		var icoPath = path.join(__dirname, 'public', req.url);
		var ico = fs.readFileSync(icoPath);
		res.writeHead(200, {"Content-Type": "image/x-icon"});
		res.end(ico, 'binary');
	
	} else if (req.url === "/address"){
		var body = "";
		req.on('data', function(chunk){
			body += chunk;
		});
		req.on('end', function(){
			// return string after address
			var address = body.slice(8);
			geocodeplus.locate(address, function(georesults){

				// quietly throw error
				if ( typeof georesults.error !== 'undefined' ){
					res.writeHead(200, {"Content-Type": "text/plain"});
					res.end(`geocode error - ${georesults.error}`);
					return;
				}

				// fetch forcast
				forecast.fetch(georesults, function(forecastData){
					var nodeCAST = {
						"full_address": georesults.full,
						"current": {
							"summary": forecastData.currently.summary,
							"temp": forecastData.currently.temperature,
							"feels": forecastData.currently.apparentTemperature,
							"humidity": forecastData.currently.humidity
						},
						'daily': []
					}

					// Build Daily Forecast
					for( i=0; i<forecastData.daily.data.length; i++){
						var newTime = new Date(forecastData.daily.data[i].time * 1000);
						nodeCAST.daily[i] = {
							"time": newTime,
							"summary": forecastData.daily.data[i].summary,
							"min": forecastData.daily.data[i].temperatureMin,
							"max": forecastData.daily.data[i].temperatureMax,
							"humidity": forecastData.daily.data[i].humidity
						}
					}
					// quietly throw errors
					if ( typeof forecastData.error !== 'undefined' ){
						res.writeHead(200, {"Content-Type": "text/plain"});
						res.end(`forecast error - ${forecastData.error}`);
					}

					// respond with json string
					nodeCASTstring = JSON.stringify(nodeCAST);
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end(nodeCASTstring);
				});
			}); // end locate
		}); // end req.on(end)
	} else {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.end("oops");
	}

}).listen(3000);
console.log("nodeCAST Server running on port 3000");
