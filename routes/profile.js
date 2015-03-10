exports = {};
var User = require('../models/user');

exports.getData = function(req, res){
	var username = req.session.passport.user.displayName
	User.findOne({PHRname: username}, function(err, user){
		if (err) {
			res.status(500);
		} else {
			var data = { votes: user.upvotes, comments: user.comments, playlists: user.playlists}
			res.send(data);
		}
	});
		
};

module.exports = exports;