const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');//--> has access to passport-local-mongoose

exports.local = passport.use(new LocalStrategy(User.authenticate())); //LocalStrategy instance requires verifycallback function (authenticate() from passport-local-mongoose) to verify against locally stored username/passwords

//Serialize/Deserialize for storing in session data
passport.serializeUser(User.serializeUser()) 
passport.deserializeUser(User.deserializeUser())