var fs = require("fs"),
    config = require("../config"),
    redis = require("redis"),
    client = redis.createClient();

function sortPostit(el1, el2) {
    if (el1.type == el2.type) {
        var tmpdate = el1.date - el2.date;
        if (tmpdate == 0) return 0;
        else if (tmpdate < 0) return -1;
        else return 1;
    }
    return el1.type.localeCompare(el2.type) *-1;
}

/**
 * http return request.
 */

function ok(req, res) {
    res.statusCode = 200;
    res.end('OK');
}
/**
 * mainfeatures of the rest service.
 */
exports.action = function(req, res) {
    var tmp = [],
        jsonquery = require('url').parse(req.url, true),
        retour = [];
    client.keys("postit:*", function(err, replies) {
        console.log(replies)
        if (replies && replies.length > 0) {
            var tmp = 0;
            replies.forEach(function(reply, i) {
                console.log("test " + reply);
                client.hgetall(reply, function(err, resultat) {
                    console.log("resultat " + resultat.title);
                    retour.push(resultat);
                    tmp++;
                    if (tmp == replies.length) {
                        res.end(JSON.stringify(retour.filter(function(element) {
                            console.log(element.active)
                            return element.active == "true";
                        }).sort(
                        sortPostit)));
                    }
                });
            });
        } else {
            res.end(JSON.stringify(retour));
        }
        //      client.quit();  
    });

}
