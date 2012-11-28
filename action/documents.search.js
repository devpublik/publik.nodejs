/*
 * actions which search the ged document to the database.
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var config = require("../config"),
path = require("path"),
    redis = require("redis"),

    client = redis.createClient();

function searchMotor(search, res) {
    client.keys("ged:*", function(err, replies) {
        if (replies) {

            var nbresult = replies.length,
                nbTreat = 0,
                retour = [];
            replies.forEach(function(reply, i) {
                client.hgetall(reply, function(err, currentObjt) {
                    nbTreat++;
                    if (currentObjt.name.toLowerCase().indexOf(search.toLowerCase()) != -1) {
                        retour.push(currentObjt);
                    }
                    if (nbTreat == nbresult) {
                        res.end(JSON.stringify(retour));
                    }
                });
            });

        } else {
            res.end("[]");
        }
    });
}

function searchByName(name, res) {
	
	var documentFolder = config.get("documentFolder"),absolutePathDocument = path.resolve(documentFolder);

    client.keys("ged:*", function(err, replies) {
        if (replies) {

            var nbresult = replies.length,
                nbTreat = 0,
                retour ={
                            resultat: false
                        };
            replies.forEach(function(reply, i) {
                client.hgetall(reply, function(err, currentObjt) {
                    nbTreat++;
                    if (currentObjt.name.toLowerCase() == name.toLowerCase()) {
                    	var relativePath	=currentObjt.absolutePath.replace(absolutePathDocument,"")
                    		.replace(/\\/g,"/");
                        retour = {
                            resultat: true,
                            type : currentObjt.type,
                            relativePath: relativePath
                        };

                    }
                    if (nbTreat == nbresult) {

                        res.end(JSON.stringify(retour));
                    }
                });
            });

        } else {
            res.end(JSON.stringify({
                resultat: false
            }));
        }
    });
}

/**
 * mainfeatures of the rest service.
 */
exports.action = function(req, res) {
    var jsonquery = require('url').parse(req.url, true),
        key = jsonquery.query.search,
        by = jsonquery.query.by;
    console.log(key +"/"+by)
    if (!key) {
        key = "";
    }
    if (by == "name") {
    	searchByName(key,res);
    } else {
        searchMotor(key, res);
    }
};
