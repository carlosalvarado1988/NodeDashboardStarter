'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

const path = require('path')
const logger = require('morgan')
const csrf = require('csurf')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const MONGO_LOCAL = 'mongodb://localhost/adseek'
const mongoURI = MONGO_LOCAL
const mongoose = require('mongoose')
mongoose.connect(mongoURI, function (err) {
  if (err) {
    console.log('ERROR: Unable to connect to MongoDB')
    throw err
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('port', (process.env.PORT || 3000))

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('express-session')({
  secret: 'check out the sunset over the lake',
  resave: false,
  saveUninitialized: false
}))
app.use(logger('dev'))
app.use(passport.initialize())
app.use(passport.session())

// CSRF
app.use(csrf(), function (req, res, next) {
  res.locals._csrf = req.csrfToken()
  next()
})

// passport config
const Account = require('./models/account')
passport.use(new LocalStrategy(Account.authenticate()))
passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())

const routes = require('./routes/index')
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
app.use(function (err, req, res, next) {  // Bad CSRF token
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('HTTP request tampered with. Invalid CSRF token.')
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    title: 'error',
    message: err.message,
    error: {},
    user: req.user,
    csrf: res.locals._csrf
  })
})

app.listen(app.get('port'), function () {
  console.log(`Server is online and listening on port ${app.get('port')}`)
})

module.exports = app
