exports = {};
var User = require('../models/user');

exports.getData = function(req, res){
	console.log(req.user);
	var username = req.session.passport.user.PHRname
	var token = req.user.lastToken;
	User.findOne({PHRname: username}, function(err, user){
		if (err) {
			res.status(500);
		} else {
			var data = { spotifyId: user.spotifyId, upvotes: user.upvotes, comments: user.comments, playlists: user.playlists, token: token}
			console.log('data');
			console.log(data);
			res.send(data);
		}
	});

};

module.exports = exports;