'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

const path = require('path')
const logger = require('morgan')
const flash = require('express-flash')
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport('smtps://user%40example.com:csmmbw1jtfb@smtp.gmail.com')
const async = require('async')
const crypto = require('crypto')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const MONGO_LOCAL = 'mongodb://localhost/sample'
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
app.use(flash())
app.use(logger('dev'))
app.use(passport.initialize())
app.use(passport.session())

// passport config
const Account = require('./models/account')
passport.use(new LocalStrategy(Account.authenticate()))
passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())

// Forgotten password middleware
app.post('/forgot', (req, res, next) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex')
        done(err, token)
      })
    },
    function (token, done) {
      Account.findOne({ email: req.body.email }, (err, user) => {
        if (err) done(err)
        if (!user) {
          req.flash('error', 'No account with that email address exists.')
          return res.redirect('/forgot')
        }

        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

        user.save(function (err) {
          done(err, token, user)
        })
      })
    },
    function (token, user, done) {
      let mailOptions = {
        to: user.email,
        from: 'no-reply@mail.com',
        subject: '[REQUESTED] Password Reset',
        text: 'You are receiving this because you (or someone else) requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not make this request, please disregard this email and your password will remain unchanged.\n'
      }

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) { done(err) }
        console.log('Message sent: ' + info.response)
        done()
      })
    }
  ], function (err) {
    if (err) return next(err)
    res.redirect('/')
  })
})

// Routes
const routes = require('./routes/index')
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      title: '',
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
    title: 'Error',
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
