	var http =  require("http");


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


exports.action = function(req,res){

	 http.get("http://news.google.fr/news?pz=1&cf=all&ned=fr&hl=fr&output=rss", function(resultat) {
		 var retour = '';
		// console.log('STATUS: ' + resultat.statusCode);
		 new StreamBuffer(resultat);
		 resultat.streambuffer.ondata(function(chunk) {
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		 
			   // console.log('BODY: ' + chunk);
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
		});});
};