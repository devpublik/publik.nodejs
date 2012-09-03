/*
 * script to manage configuration of the application
 * Author: github.com/devpublik / publik.nodejs
 * Make sure you've read the readme: github.com/devpublik / publik.nodejs/publik
 * Everything is explained there.
 */
module.exports = {
  
  get: function (key) {
  	var myData = require('./config.json');
   	var arrJson = eval(myData);

   	return arrJson[key];
  }
}