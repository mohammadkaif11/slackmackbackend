const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID ='1001041294556-4gh0mmubqphu0otihqmjpesjnkgovef8.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
    
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});