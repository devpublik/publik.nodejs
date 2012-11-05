var config = require("../config"),redis = require("redis"),
        client = redis.createClient();

/**
* http return request.
*/
function ok(req,res){
	res.statusCode = 200;
	  res.end('OK');
}


/**
* mainfeatures of the rest service.
*/
exports.action = function(req,res){
	var jsonquery = require('url').parse(req.url, true),
		id=jsonquery.query.id;	
	console.log("supprimer "+id);
	client.hset("postit:"+id, "active", false, redis.print);
	ok(req, res);
}