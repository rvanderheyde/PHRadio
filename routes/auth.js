routes = {};
var User = require('../models/user');

routes.fbAuth = function(req, res){
  
};

routes.fbAuthCallback = function(req, res){
  //callback for facebook passport
  console.log('FB returns ' + req.session.passport.user.displayName);
  var username = req.session.passport.user.displayName;
  User.findOne({name: username}, function(error, user){
    if (user) {
      res.redirect('/');
    } else {
      var newUser = User({name: username, votes: []});
      newUser.save(function (err) {
        if (err) {
          console.log('cant save new user');
          res.status(500);
        } else {
          res.redirect('/');
        }
      });
    }
  }); 
};

module.exports = routes;