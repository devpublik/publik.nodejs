/*
 * actions which create new ged document on server
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var fs =  require("fs"),
config = require("../config"),
 formidable = require("formidable"),
 sys = require("sys"),
 events = require("events");

/**
* http return request.
*/
function ok(req,res){
	res.statusCode = 200;
	  res.end('OK');
}

/**
* create a link on web site
*/
function createUrlFile(req, res,path,adress){

	fs.exists( path,function (exists) {
				if(!exists){
					var tmpAdress =  adress;
					if(tmpAdress.search("http:")==-1)
							tmpAdress = "http://"+tmpAdress;
	var template = "[{000214A0-0000-0000-C000-000000000046}]\n"+"Prop3=19,2\n"+"[InternetShortcut]\n"+"URL="+tmpAdress+"\n"+"IDList=";
	fs.writeFile(path, template, function (err) {
  if (err) return console.log(err);
  		console.log('ecriture du fichier '+path);
  });
}});
}

/**
* upload a document.
*/
function upload_file(req, res,path) {
	 if (req.method == 'POST') {
         console.log("[200] " + req.method + " to " + req.url);

         var form = new formidable.IncomingForm(),
         files = [],
         fields = [];
         form.uploadDir = path;
         form 
         .on('field', function(field, value) {
             console.log(field, value);
             fields[fielde] =  value;
           })
           .on('file', function(field, file) {
             console.log(field, file);
             files[field]= file;
           })
           .on('end', function() {
             console.log('-> upload done');
             fs.rename(files["upload"].path,path+files["upload"].name, function (err)  {
		         if (err) {
			         fs.unlink(path+files["upload"].name);
			         console.log("Value of files.upload.path : " + files["upload"].path+"|"+path+files["upload"].name );
			         fs.rename(files["upload"].path,path+files["upload"].name);
		         }   });
             ok(req, res);
           });
         
         
        form .parse(req);


       } else {
         console.log("[405] " + req.method + " to " + req.url);
         res.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
         res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
       }
}	

/**
* mainfeatures of the rest service.
*/
exports.action = function(req,res){
	var jsonquery = require('url').parse(req.url,true),path,documentFolder = config.get("documentFolder");
	switch (jsonquery.query.type){
		case "directory" :
			 path = documentFolder+jsonquery.query.path;
			fs.exists( path,function (exists) {
				if(!exists){
					fs.mkdirSync(path);
				}
				ok(req, res);
				
			});
			
			break;
		case "file":
			 path =__dirname+"/../"+ documentFolder+jsonquery.query.path+"/";
			 upload_file(req, res,path);
			console.log(jsonquery.query.type);
			break;
		case "url":
			path = documentFolder+jsonquery.query.path+"/"+jsonquery.query.name+".url";
			createUrlFile(req, res,path,jsonquery.query.adress);
			break;
		default : 
			console.log(jsonquery);
	}
	console.log("appeler OK");
	ok(req, res);
}
	
	 
