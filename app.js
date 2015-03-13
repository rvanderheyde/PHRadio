var mongoose = require('mongoose');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var SpotifyStrategy = require('passport-spotify').Strategy;
var SoundCloudStrategy = require('passport-soundcloud').Strategy;

var User = require('./models/user');
var Playlist = require('./models/playlists');

var index = require('./routes/index');
var auth = require('./routes/auth');
var profile = require('./routes/profile');
var playlists = require('./routes/playlists');


var app = express();
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var PORT = process.env.PORT || 3000;

var CLIENTIDSPOT = process.env.CLIENTIDSPOT || require('./oauth.js').spotify.clientID;
var CLIENTSECRETSPOT = process.env.CLIENTSECRETSPOT || require('./oauth.js').spotify.clientSecret;
var CALLBACKURLSPOT = process.env.CALLBACKURLSPOT || require('./oauth.js').spotify.callbackURL;
var SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID || require('./oauth.js').soundcloud.clientID;
var SOUNDCLOUD_CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET || require('./oauth.js').soundcloud.clientSecret;
var SOUNDCLOUDCLIENTURL = process.env.SOUNDCLOUDCLIENTURL || require('./oauth.js').soundcloud.callbackURL;
 
mongoose.connect(mongoURI);

passport.serializeUser(function(user, done) {
  console.log(user);
done(null, user);
});
passport.deserializeUser(function(obj, done) {
done(null, obj);
});

passport.use(new SpotifyStrategy({
    clientID: CLIENTIDSPOT,
    clientSecret: CLIENTSECRETSPOT,
    callbackURL: CALLBACKURLSPOT
  },
  function(accessToken, refreshToken, profile, done) {
    // process.nextTick(function (err, user) {
    //   return done(err, user);
    console.log(profile.displayName)
    User.findOne({ spotifyId: profile.id }, function (err, user) {
      if (user) { 
        user.lastToken = accessToken;
        return done(err, user); 
      } else {
        var newUser = User({PHRname: profile.displayName , scId:'', spotifyId: profile.id, liked: [], upvotes: [], comments: [], playlists: [] })
        newUser.save(function (err) {
          if (err) {
              console.log('cant save new user');
              res.status(500);
          } else {
            user.lastToken = accessToken;
            return done(err, user);
          }
        });
      }
    });
  }
));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'This is not a secret ;)',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// Main route
app.get('/', index.indexRender);

app.get('/auth/spotify', passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'] }), auth.fbAuth);
app.get('/auth/spotify/callback',passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], failureRedirect: '/' }), auth.spotAuthCallback);

app.get('/session/username', auth.getUsername);
app.post('/session/end', auth.loggingOut);
app.get('/user/:username', profile.getData);

//for testing only
app.get('/secret/secret', function(req, res){
  res.send({secret: SOUNDCLOUD_CLIENT_ID})
});


// API routes
app.get('/api/playlists', playlists.allPlaylists);
app.post('/api/playlists', playlists.postPlaylists);
app.get('/api/playlists/by/upvote', playlists.byUpvotes);
app.post('/api/playlists/add', playlists.addPlaylist);
app.post('/api/upvote', playlists.upvote);


app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});


