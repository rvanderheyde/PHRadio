var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	PHRname: String,
	spotifyId: String,
	scId: String,
	upvotes: Array,
	comments: [String],
	playlists: Array,
	lastToken: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;