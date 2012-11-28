/*
 * actions which update redis database for ged document
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
var fs = require("fs"),
    config = require("../config"),
    formidable = require("formidable"),
    sys = require("sys"),
    path = require("path"),
    redis = require("redis"),
    client = redis.createClient(), nbfiles=0, currentfiles=0;

/**
* default function for the management of redis callback
**/
resultRedis = function(err, reply) {
    if (err) {
        console.log(err)
    }
}

/**
* Attach the parent to the child
**/
function createParent(type, key, absolutePath) {
    if (absolutePath) {
        //    console.log(absolutePath    )
        client.keys("ged:directory:*", function(err, replies) {
            replies.forEach(function(reply, index) {
                client.hgetall(reply, function(err, currentObjt) {
                    if (currentObjt && currentObjt.absolutePath == absolutePath) {
                        client.hset(["ged:" + type + ":" + key, "parent", reply], resultRedis);
                        console.log("ged:" + type + ":" + key);
                     

                    }
                });

            });
        });

    }
}

/**
* delete All ged key to the initialization.
**/
function deleteAll() {
    client.keys("ged:*", function(err, replies) {
        if (replies && replies.length > 0) {
            replies.forEach(function(reply, i) {
                client.del(reply, resultRedis);
            });
        }
    });

}

/**
* create a new entry in redis.
**/
function create(type, name, absolutePath, parentPath) {
    client.send_command("INCR", ["ged"], function(out, key, dd) {
        if (!out) {
            client.hset(["ged:" + type + ":" + key, "id", key], resultRedis);
            client.hset(["ged:" + type + ":" + key, "name", name], resultRedis);
            client.hset(["ged:" + type + ":" + key, "type", type], resultRedis);
            client.hset(["ged:" + type + ":" + key, "absolutePath", absolutePath], resultRedis);
            createParent(type, key, parentPath)

        }
    });
}

/**
* add apath to redis.
**/
function addToRedis(type, relativePath) {
    var name, parentPath, absolutePath = path.resolve(relativePath);
    switch (type) {
    case "directory":
        name = relativePath.substring(relativePath.lastIndexOf("/") + 1);
        break;
    case "url":
        name = relativePath.substring(relativePath.lastIndexOf("/") + 1).replace(".url", "");
        break;
    default:
        // files
        name = relativePath.substring(relativePath.lastIndexOf("/") + 1);
    }
    parentPath = relativePath.substring(0, relativePath.lastIndexOf("/"));
    if (parentPath != config.get("documentFolder")) {
        parentPath = path.resolve(parentPath);
    } else {
        parentPath = null;
    }

    create(type, name, absolutePath, parentPath);

}

/**
* Travel the files system and add the directory and the files to redis.
**/
function travelTreeFiles(currentPath, parent) {
    var relativePath = config.get("documentFolder") + currentPath;
   
    if (parent) {
        relativePath = parent + "/" + currentPath;
    }
    nbfiles++;
    fs.stat(relativePath, function(err, stats) {
        if (err) {
            console.log("error : " + err);
            return;
        }
        if (stats.isDirectory()) {
            var directory = path.resolve(relativePath);
            console.log("directory : " + relativePath);
            if (parent) {
                addToRedis("directory", relativePath);
            }
            fs.readdir(directory, function(err, files) {
                //console.log("relativePath "+relativePath+"/"+files);
                if (files) {
                    files.forEach(function(file) {
                        travelTreeFiles(file, relativePath);
                    });
                }
            });

        } else {
            // files -
            console.log("file : " + relativePath);
            if (relativePath.lastIndexOf(".url") == -1) {
                addToRedis("file", relativePath)
            } else {
                addToRedis("url", relativePath)
            }
        }
    });
};

exports.action = function(req, res) {
    
    deleteAll();
     nbfiles = 0;
    currentfiles = 0;
    travelTreeFiles("", null);
    res.statusCode = 200;
      res.end('OK');
};
