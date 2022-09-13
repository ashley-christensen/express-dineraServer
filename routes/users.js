const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  if (req.user.admin) {
    User.find()
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      })
      .catch(err => next(err));
  }
});

router.post('/signup', cors.corsWithOptions, (req, res) => {
  User.register(//plugin provided by passport to handle username, password
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;//internal server error
        res.setHeader('Content-Type', 'application/json');//expect json response
        res.json({ err: err });
      } else { // no error, authenticate user
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    }
  );
});

//local strategy to authenticate user, no error moves to 3rd middleware function 
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });//userid from req object
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfullly logged in!' });
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();//delete session file on serverside
    res.clearCookie('session-id'); //clear cookie being stored on client
    res.redirect('/');//redirect user on root path
  } else {//if session doesn't exist
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;