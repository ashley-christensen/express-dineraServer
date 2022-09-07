const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user) {
        const err = new Error(`User ${req.body.username} already exists`);
        err.status = 403;
        return next(err);
      } else {
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration Successful', user: user });
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  if (!req.session.user) {//user not already logged in, handle login
    const authHeader = req.headers.authorization;
    if (!authHeader) {//Challenge client for Authentication
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          const err = new Error(`User ${username} does not exist!`);
          err.status = 401;
          return next(err);
        } else if (user.password !== password) {
          const err = new Error('Your password is incorrect!');
          err.status = 401;
          return next(err);
        } else if (user.username === username && user.password === password) {
          req.session.user = 'authenticated';//start tracking session for user 
          res.statusCode = 200;
          res.setHeader('Content-Type', 'tet/plain');
          res.end('You are authenticated!');
        }
      })
      .catch(err => next(err));

  } else {//session being tracked for client
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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
