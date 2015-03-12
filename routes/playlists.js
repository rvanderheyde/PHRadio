routes = {};

var Playlist = require('../models/playlists');
var User = require('../models/user');

routes.allPlaylists = function (req, res) {
	// Find all playlists in the db
	Playlist.find({}).populate('_author').exec( function(err, playlists) {
		if (err) {
			console.error("Couldn't find playlists ", err);
			res.status(500).send("Couldn't find any playlists!");
		};
		// Send an array of all the playlists
		res.send(playlists);
	});
};

routes.byUpvotes = function (req, res) {
	// Find all playlists in the db 
	// Sort in descending order by number of upvotes
	Playlist.find({}).populate('_author').sort({upvotes: -1}).exec(function (err, playlists) {
		if (err) {
			console.error("Couldn't find and sort playlists by upvotes", err);
			res.status(500).send("Couldn't find and sort playlists by upvotes");
		};
		// Send the sorted array of playlists
		res.send(playlists);
	});
};

// TODO: Does this work?
routes.searchPlaylists = function (req, res) {
	// Get user query
	var userQuery = res.body.query;

	// Search for playlist titles containing the user query
	Playlist.find({ title: { "$regex": userQuery, "$options": "i" }}, function (err, playlists) {
		if (err) {
			console.error("Couldn't search playlists by title", err);
			res.status(500).send("Couldn't search playlists by title");
		};
		// Send the resulting playlist array
		res.send(playlists);
	});

};

routes.addPlaylist = function (req, res) {
	// Get info for new playlist from user post request
	var title = req.body.title;
	var playlistId = req.body.playlistId;

	var authorId = req.user._id;
	var dateAdded = new Date();
	var upvotes = 0;

	// Create new playlist object
	var newPlaylist = new Playlist({title: title, _author: authorId, playlistId: playlistId, 
		dateAdded: dateAdded, upvotes: upvotes});

	// Add new playlist to db
	newPlaylist.save(function (err, playlist) {
		if (err) {
			console.error("Couldn't save new playlist ", err);
			res.status(500).send("Couldn't save the new playlist!");
		};
		// Send the new playlist object
		res.send(playlist);
	});
};

routes.upvote = function (req, res) {
	// Get id of playlist to update from user post
	var playlistId = req.body.playlistId;
	var currUpvotes = req.body.upvotes;

	var newUpvotes = currUpvotes + 1;
	console.log(req.body.playlistId);

	var strPlaylistId = playlistId.toString();
	console.log(typeof strPlaylistId);

	// Update the playlist with the new value 
	Playlist.findOneAndUpdate({playlistId : strPlaylistId}, {upvotes: newUpvotes}, function (err, playlist) {
		if (err) {
			console.error("couldn't add an upvote to playlist", err);
			res.status(500).send("Couldn't update the upvote count!");
		};
		console.log(playlist);
		res.send(playlist);
	});
};

module.exports = routes;



