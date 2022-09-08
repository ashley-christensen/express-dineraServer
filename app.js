
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const session = require('express-session');
const FileStore = require('session-file-store')(session);//returns function to call session
const passport = require('passport');
const authenticate = require('./authenticate');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dineRouter = require('./routes/dineRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

// const url = 'mongodb://localhost:27017/dinera';
const uri = process.env.DB_URI;
const connect = mongoose.connect(uri, {
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
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345'));

app.use(session({ //calling function returned by import
  name: 'session-id',
  secret: '12345-67891-12345-67891',
  saveUninitialized: false,//on request end, not saved = avoid empty session files/cookies
  resave: false,//Keep session marked as active
  store: new FileStore()//creates new file store object to save session info to server disk
}));

//passport middleware --> check for existing client session, load on req.user
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

//authenticatation
function auth(req, res, next) {
  if (!req.user) {//no session from passport middlware = not authenticated
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  } else {
    return next();
  }
}

// app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

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
