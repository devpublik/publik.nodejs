/*
 * actions which can read a ged document
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var send = require('connect/node_modules/send'),
    fs = require("fs"),
    util = require("util"),
    config = require("../config"),
    fileUrlRegExp = /\.url/,
    urlBodyRegExp = /.*URL=(.*)\nIDList=/;

/**
 * parse the directory folder.
 */

function getDirectoryFiles(directory, callback, callbackNoFiles) {
    fs.readdir(directory, function(err, files) {
        var nbFiles = files.length,
            index = 0;
        if (nbFiles > 0) {
            files.forEach(function(file) {
                fs.stat(directory + '/' + file, function(err, stats) {
                    index++;
                    if (stats.isFile()) {
                        callback(directory + '/' + file, true, nbFiles, index);
                    } else if (stats.isDirectory()) {
                        callback(directory + '/' + file, false, nbFiles, index);
                    }
                });
            });
        } else {
            console.log("no files")
            callbackNoFiles();
        }
    });

}
/**
 * HTTP response when the application produce a error.
 */

function ko(err, res) {
    if (err) console.log(err);
    res.statusCode = 500;
    res.end('KO');
}

/**
* transform the path url parameter on string.
**/
function parsePathParameter(jsonquery) {
    var querystring = require("querystring");
    var raw = querystring.parse(jsonquery.query.path);
    if (raw) {
        for (var property in raw) {
            return property;
        };
    }

    return "";
}

/**
 * mainfeatures of the rest service.
 */
exports.action = function(req, res) {
    var pathlib = require("path");
    var jsonquery = require('url').parse(req.url, true),
        path, retour = [],
        documentFolder = config.get("documentFolder");

    var tytypath = parsePathParameter(jsonquery);
    //console.log("dsd " + tytypath)
    var path = documentFolder + "/" + tytypath;
    //path = pathlib.join(documentFolder,tytypath);
    //console.log("dsd " + pathlib.resolve(path))

    fs.stat(path, function(err, stats) {
        if (err) {
            ko(err, res);
            return;
        }

        if (stats.isDirectory()) {
            var tmp = 0;
            getDirectoryFiles(path, function(path, isFile, nbFiles, index) {
                console.log("nbFiles" + nbFiles)
                if (nbFiles == 0) {
                    res.end("{}");
                }

                fs.stat(path, function(err, substats) {
                    var objectJSON, tmppath = path.replace(documentFolder + "/", "");

                    if (substats.isDirectory()) {

                        objectJSON = {
                            "nbFiles": nbFiles,
                            "index": index,
                            "type": "directory",
                            "path": tmppath,
                            "dmodif": substats.mtime.getTime()
                        };

                    } else {
                        if (path.search(fileUrlRegExp) == -1) {
                            objectJSON = {
                                "nbFiles": nbFiles,
                                "index": index,
                                "type": "file",
                                "path": tmppath,
                                "dmodif": substats.mtime.getTime()
                            }
                        } else {
                            objectJSON = {
                                "nbFiles": nbFiles,
                                "index": index,
                                "type": "url",
                                "path": tmppath,
                                "dmodif": substats.mtime.getTime()
                            }
                        }
                    }
                    // add the file to result
                    retour.push(objectJSON);
                    tmp++;

                    if (tmp == nbFiles) {
                    	// if no files to parse then return the http response.
                        res.end(JSON.stringify(retour));
                    }

                });

            }, function() {
            	// if empty directory
                res.end(JSON.stringify(retour));
            });
            //return;
        } else {
            // renvoyer le flux

            if (path.search(fileUrlRegExp) == -1) {
            	// throw the byytes stream.
                send(req, path).pipe(res);
            } else {
                // if url type files.

                fs.readFile(path, function(err, data) {
                    if (err) throw err;
                    console.log(data + "dd\n");

                    var arr = urlBodyRegExp.exec(data)
                   	// throw the http response.
                    res.writeHead(302, {
                        'Location': arr[1]

                    });
                    res.end();
                });


            }
        }

    });

};
