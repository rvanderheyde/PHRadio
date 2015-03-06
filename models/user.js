var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	PHRname: String,
	spotifyId: String,
	liked: Array
});

var User = mongoose.model('User', userSchema);

module.exports = User;