var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	PHRname: String,
	spotifyId: String,
	upvotes: Array,
	comments: Array,
	playlists: Array
});

var User = mongoose.model('User', userSchema);

module.exports = User;