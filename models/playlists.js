var mongoose = require('mongoose');

var playlistSchema = mongoose.Schema({
	playlistId: String,
	upvotes: Number,
	dateAdded: Date,
	img: String,
	title: String,
	_author: { type: Number, ref: 'User' }
});

var Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;