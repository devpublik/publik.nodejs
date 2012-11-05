/*
 * core of the application
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var connect = require("connect"),  
config = require("./config"),
exec = require('child_process').exec,
child;  
/**
 * Launch Redis server.
 */
child= exec("launch_redis.bat",
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});


/**
 * Launch Http server of the node JS
 */
var app = connect()
.use(connect.logger('dev'))
/**
 * REST Service for the web application
 */
.use("/services",function(req, res){
	
	var jsonObject = require('url').parse(req.url,true);
	require("./action/" +
			jsonObject.query.action +
			".js").action(req,res);

})
/**
 * web server static of the html files
 */
.use(connect.static(__dirname +  '\\html',{redirect:false}))
/**
 * incorrect url management
 */
.use(function(req, res){
  
  res.statusCode = 404;
  res.end("Impossible de trouver l'url correspondante");
})

.listen(config.get("httpPort"));