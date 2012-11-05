var fs =  require("fs"),
config = require("../config"),redis = require("redis"),
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
	var tmp =[],jsonquery = require('url').parse(req.url,true);
	//jsonquery.query.path
	client.send_command("INCR",["postit"], function (out,key,dd){
		if(!out){
    		console.log("Nouvelle clé "+key);
    		client.hset(["postit:"+key, "id", key], redis.print);
    		client.hset(["postit:"+key, "title", jsonquery.query.title], redis.print);
    		client.hset(["postit:"+key, "type", jsonquery.query.type], redis.print);
    		client.hset(["postit:"+key, "contains", jsonquery.query.contains], redis.print);
    		client.hset(["postit:"+key, "active", true], redis.print);
    		client.hset(["postit:"+key, "date", new Date().getTime()], redis.print);
    		client.send_command("BGSAVE",tmp, function (out,tt,dd){
     			console.log(" Enregistrement sur le disque "+tt);
			});
 		}
	});
	//
	
	console.log("appeler OK");
	ok(req, res);
}