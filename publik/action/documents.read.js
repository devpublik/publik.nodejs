/*
 * actions which can read a ged document
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var send = require('connect/node_modules/send'),
fs =  require("fs"),
util = require("util"),
config = require("../config"),
fileUrlRegExp=/\.url/,
urlBodyRegExp= /.*URL=(.*)\nIDList=/;

/**
* parse the directory folder.
*/
function getDirectoryFiles(directory, callback) {
	  fs.readdir(directory, function(err, files) {
		var nbFiles = files.length
		, index = 0;
		
	    files.forEach(function(file){
	      fs.stat(directory + '/' + file, function(err, stats) {
	    	  index++;
	        if(stats.isFile()) {
	          callback(directory + '/' + file,true,nbFiles,index);
	        } else if(stats.isDirectory()) {
	        	callback(directory + '/' + file,false,nbFiles,index);
	        }
	      });
	    });
	  });
}
/**
* HTTP response when the application produce a error.
*/
function ko(err,res){
	if(err)
	console.log(err);
	res.statusCode = 500;
	  res.end('KO');	
}

/**
* mainfeatures of the rest service.
*/
exports.action = function(req,res){
	
	var jsonquery = require('url').parse(req.url,true),path,retour = [],documentFolder = config.get("documentFolder");
	path=documentFolder+"/"+jsonquery.query.path;
	
	
	fs.stat(path, function(err, stats) {
		if(err){
			ko(err,res);
			  return;
		}
		
		if(stats.isDirectory()){
			var tmp =0;
		getDirectoryFiles(path, function(path,isFile,nbFiles,index){
			
			fs.stat(path, function(err, substats) {
				var objectJSON, tmppath = path.replace(documentFolder+"/","") ;

				if(substats.isDirectory()){
				
					 objectJSON = {
							"nbFiles":nbFiles,
							"index":index,
							"type":"directory",
							"path": tmppath, 
							"dmodif" : substats.mtime.getTime()
					};
			
				} else{
					if(path.search(fileUrlRegExp) == -1) {
					 objectJSON = {
							"nbFiles":nbFiles,
							"index":index,
							"type":"file",
							"path":tmppath,
							"dmodif" : substats.mtime.getTime()
					  }
				} else {
					objectJSON = {
						"nbFiles":nbFiles,
						"index":index,
						"type":"url",
						"path":tmppath,
						"dmodif" : substats.mtime.getTime()
				  }
				}



			}
			//console.log(substats)
			retour.push(objectJSON);	
			tmp++;	
				
			
			if(tmp == nbFiles){
				
				res.end(JSON.stringify(retour));
			}
		
			});
			
		});
			//return;
		} else {
			// renvoyer le flux
			
			if(path.search(fileUrlRegExp) == -1) {
				send(req, path).pipe(res);
			} else {
				console.log("url file");

				fs.readFile(path, function (err, data) {
  					if (err) throw err;
  						console.log(data+"dd\n");

  						var arr = urlBodyRegExp.exec(data)
  						//console.log(arr);
  						res.writeHead(302, {
  						'Location': arr[1]
 				
						});
						res.end();
				});

				
			}
		}
		
	});
	 
};