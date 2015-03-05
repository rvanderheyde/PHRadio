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
    User.findOrCreate({ spotifyId: profile.id }, function (err, user) {
      return done(err, user);
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
app.get('/auth/spotify/callback',passport.authenticate('spotify', { failureRedirect: '/' }), auth.fbAuthCallback);
app.get('/session/username', auth.getUsername)
app.post('/session/end', auth.loggingOut)

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});