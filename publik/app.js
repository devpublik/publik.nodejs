var sys = require("sys"),  
my_http = require("http"),  
path = require("path"),  
connect = require("connect"),  
filesys = require("fs"),
config = require("./config");  




var app = connect()
.use(connect.logger('dev'))

.use("/services",function(req, res){
	
	var jsonObject = require('url').parse(req.url,true);
	require("./action/" +
			jsonObject.query.action +
			".js").action(req,res);

})
.use(connect.static(__dirname +  '\\html',{redirect:false}))
.use(function(req, res){
  
  res.statusCode = 404;
  res.end('sorry!');
})

.listen(config.get("httpPort"));