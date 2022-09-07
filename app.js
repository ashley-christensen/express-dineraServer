
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dineRouter = require('./routes/dineRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/dinera';
// const uri = process.env.DB_URI;
const connect = mongoose.connect(url, {
  // dbName: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // pass: process.env.DB_PASS,
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
connect.then(() => {
  console.log('Connection estabislished with MongoDB');
  console.log('Connected successfully to server');
})
  .catch(error => console.error(error.message));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware;
app.use(cors(
  //   {
  //   // react app location -- for testing on localhost - http://localhost:3000
  //   origin: "http://localhost:3000",
  //   credentials: true
  // }
));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//authenticatation Auth()
function auth(req, res, next) {
  if (!req.signedCookies.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');//basic challenge to client
      err.status = 401; //standard err when credentials not provided
      return next(err);
    }

    //parse user/pass into array ['user', 'pass]
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {//granted: pass control to next middleware
      res.cookie('user', 'admin', { signed: true });
      return next();//access granted
    } else {
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }
}

// app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dines', dineRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
