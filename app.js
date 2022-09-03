
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

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require('mongoose');

// const url = 'mongodb://localhost:27017/dinera';
// const uri = process.env.DB_URI;
// const connect = mongoose.connect(uri, {
//   dbName: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   pass: process.env.DB_PASS,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true
// });

// connect
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log(" Connected to the database");
})
  // .then(() => {
  //   console.log('Connection estabislished with MongoDB');
  //   console.log('Connected successfully to server');
  // })
  .catch(error => console.error(error.message));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(cors({
  // react app location -- for testing on localhost - http://localhost:3000
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(cookieParser());
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
