var path = require('path');
routes = {}

routes.indexRender = function(req, res){
  var url = path.resolve( __dirname + '../../views/main.html');
  res.sendFile(url);
};

module.exports = routes