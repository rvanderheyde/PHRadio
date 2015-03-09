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
var index = require('./routes/index');
var auth = require('./routes/auth');


var app = express();
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var PORT = process.env.PORT || 3000;
var CLIENTIDFB = process.env.CLIENTIDFB || require('./oauth.js').facebook.clientID;
var CLIENTSECRETFB = process.env.CLIENTSECRETFB || require('./oauth.js').facebook.clientSecret;
var CALLBACKURLFB = process.env.CALLBACKURLFB || require('./oauth.js').facebook.callbackURL;
var CLIENTIDSPOT = process.env.CLIENTIDSPOT || require('./oauth.js').spotify.clientID;
var CLIENTSECRETSPOT = process.env.CLIENTSECRETSPOT || require('./oauth.js').spotify.clientSecret;
var CALLBACKURLSPOT = process.env.CALLBACKURLSPOT || require('./oauth.js').spotify.callbackURL;
var SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID || require('./oauth.js').soundcloud.clientID;
var SOUNDCLOUD_CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET || require('./oauth.js').soundcloud.clientSecret;
var SOUNDCLOUDCLIENTURL = process.env.SOUNDCLOUDCLIENTURL || require('./oauth.js').soundcloud.callbackURL;
 
mongoose.connect(mongoURI);

passport.serializeUser(function(user, done) {
done(null, user);
});
passport.deserializeUser(function(obj, done) {
done(null, obj);
});

passport.use(new FacebookStrategy({
 clientID: CLIENTIDFB,
 clientSecret: CLIENTSECRETFB,
 callbackURL: CALLBACKURLFB
}, 
function(accessToken, refreshToken, profile, done) {
 process.nextTick(function () {
   return done(null, profile);
 });
}
));

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
        return done(err, user); 
      } else {
        var newUser = User({PHRname: profile.displayName , scId:'', spotifyId: profile.id, liked: [], upvotes: [], comments: [], playlists: [] })
        newUser.save(function (err) {
          if (err) {
              console.log('cant save new user');
              res.status(500);
          } else {
            return done(err, user);
          }
        });
      }
    });
  }
));

passport.use(new SoundCloudStrategy({
    clientID: SOUNDCLOUD_CLIENT_ID,
    clientSecret: SOUNDCLOUD_CLIENT_SECRET,
    callbackURL: SOUNDCLOUDCLIENTURL
  },
  function(accessToken, refreshToken, profile, done) {
    // process.nextTick(function (err, user) {
    //   return done(err, user);
    console.log(profile.displayName)
    User.findOne({ PHRname: profile.displayName }, function (err, user) {
      if (user) { 
        if (user.scId){
          return done(err, user); 
        } else {
          user.scId = profile.id;
          user.save();
          return done(err, user);
        }
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


app.get('/', index.indexRender);
app.get('/auth/facebook', passport.authenticate('facebook'), auth.fbAuth);
app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/' }), auth.fbAuthCallback);
app.get('/auth/spotify', passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'] }), auth.fbAuth);
app.get('/auth/spotify/callback',passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], failureRedirect: '/' }), auth.spotAuthCallback);
app.get('/auth/soundcloud', passport.authenticate('soundcloud'));
app.get('/auth/soundcloud/callback', 
  passport.authenticate('soundcloud', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/session/username', auth.getUsername);
app.post('/session/end', auth.loggingOut);
app.get('/user/:username', profile.getData)

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});