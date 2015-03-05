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

routes.getUsername = function(req, res){
  //find user from session
  if (emptyObjTest(req.session.passport) === true){
    res.send('error');
  } else {
    var username = req.session.passport.user.displayName;
    var obj = { userName: username};
    if (!username){
      res.send('No User');
    } else {
      res.send(obj);
    }
  }
};

function emptyObjTest(obj){
  return Object.keys(obj).length === 0;
};

routes.loggingOut = function(req, res) {
  req.session.passport = {};
  req.session.userid = '';
  
  // send something to client to change client
  res.send('logout');
};

module.exports = routes;