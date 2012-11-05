
/*
 * actions for consulting online news ...
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var http =  require("http"),config=require("../config");


function StreamBuffer(req) {
	  var self = this

	  var buffer = []
	  var ended  = false
	  var ondata = null
	  var onend  = null

	  self.ondata = function(f) {
	    for(var i = 0; i < buffer.length; i++ ) {
	      f(buffer[i])
	    }
	    ondata = f
	  }

	  self.onend = function(f) {
	    onend = f
	    if( ended ) {
	      onend()
	    }
	  }

	  req.on('data', function(chunk) {
	    if( ondata ) {
	      ondata(chunk)
	    }
	    else {
	      buffer.push(chunk)
	    }
	  })

	  req.on('end', function() {
	    ended = true
	    if( onend ) {
	      onend()
	    }
	  })        

	  req.streambuffer = self
	}


/**
* mainfeatures of the rest service.
*/
exports.action = function(req,res){

	 http.get(config.get("newsrss"), function(resultat) {
		 var retour = '';
		
		new StreamBuffer(resultat);
		resultat.streambuffer.ondata(function(chunk) {
		 
			    retour += chunk;
		});
		  
	
		 resultat.streambuffer.onend(function() {
			//  console.log('end');
			 res.statusCode = 200;
			  res.end(retour);
		});
		resultat.on('error', function(e) {
		  console.log("Got error: " + e.message);
		  res.statusCode = 400;
		  res.end('ERROR');
		});
	});
};