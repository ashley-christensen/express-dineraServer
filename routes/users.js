const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    err => { //err first, otherwise authenticate
      if (err) {
        res.statusCode = 500;//internal server error
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    }
  );
});

//enable passport authentication, no error, continue to 3rd middlware function
router.post('/login', passport.authenticate('local'), (req, res) => {
  //passport.authenticate handles logging in user, challenging for credentials, parsing credentials, handling errors
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });

});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();//delete session file on serverside
    res.clearCookie('session-id');//clear cookie being stored on client
    res.redirect('/');//redirect user on root path
  } else {//session doesn't exist
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
