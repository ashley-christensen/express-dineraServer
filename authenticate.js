const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');//--> has access to passport-local-mongoose
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;//object with helper methods
const jwt = require('jsonwebtoken');//create, sign, verify
const config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));

//serialize & deserialize to store in session data
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
 return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

//configure json web token strategy for passport 
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
 new JwtStrategy(
  opts, //object created in configuration
  (jwt_payload, done) => {
   console.log('JWT_Payload', jwt_payload);
   User.findOne({ _id: jwt_payload._id }, (err, user) => {
    if (err) {
     return done(err, false);
    } else if (user) {//no error, user found
     return done(null, user);
    } else {//no error, no user document found for token
     return done(null, false);
    }
   });
  }
 )
);

exports.verifyUser = passport.authenticate('jwt', { session: false });