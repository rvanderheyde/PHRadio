var mongoose = require('mongoose');

var playlistSchema = mongoose.Schema({
	playlistId: String,
	upvotes: Number,
	dateAdded: Date
});

var Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;