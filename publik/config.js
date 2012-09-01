module.exports = {
  
  get: function (key) {
  	var myData = require('./config.json');
   	var arrJson = eval(myData);

   	return arrJson[key];
  }
}