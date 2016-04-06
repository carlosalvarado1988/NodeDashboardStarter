'use strict'
// ExpressJS modules
const express = require('express')
const router = express.Router()

// Additional modules
const config = require('../src/config/config')
const passport = require('passport')
const async = require('async')
const crypto = require('crypto')

// Models
const Account = require('../models/account')

// Email service
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport(`smtps://${config.SMTP.username}:${config.SMTP.password}@${config.SMTP.server}`)

const ensureAuthenticated = (req, res, next) => {
  // return next();  // DEBUG ONLY: Authenticates any and every request (NOT SECURE FOR PRODUCTION)
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login')
}

// GET /
router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard')
  } else {
    res.render('index', {title: '', user: req.user})
  }
})

router.post('/forgot', (req, res, next) => {
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
    req.flash('info', 'Please check your email account for instructions on how to reset your password.')
    res.redirect('/')
  })
})

/* Forgot password */
router.get('/forgot', (req, res) => {
  res.render('forgot', {title: '', user: req.user})
})

/* Reset password */
router.get('/reset/:token', function (req, res) {
  Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (err) {
      req.flash('error', `An error occurred while attempting to reset your account: ${err}`)
      return res.redirect('/forgot')
    }
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.')
      return res.redirect('/forgot')
    }
    res.render('reset', {
      title: '',
      user: req.user
    })
  })
})

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    (done) => {
      Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user || err) {
          req.flash('error', 'Password reset token is invalid or has expired.')
        }

        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        user.save((err) => {
          if (err) {
            done(err)
          }
          // console.log('Logging in the user...Did the password save?')
          req.logIn(user, function (err) {  // Log in the user
            user.setPassword(req.body.password, () => {
              user.save() // Save the new password
              done(err, user)
            })
          })
        })
      })
    },
    (user, done) => {
      let mailOptions = {
        to: user.email,
        from: 'no-reply@mail.com',
        subject: '[CONFIRMED] Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      }

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) { done(err) }
        console.log('Message sent: ' + info.response)
        done()
      })
    }
  ], (err) => {
    if (err) { console.error(`Error confirming password update: ${err}`) }
    res.redirect('/')
  })
})

/* Account registration */
router.get('/register', (req, res) => {
  res.render('register', {title: '', user: req.user})
})

router.post('/register', (req, res) => {
  Account.register(new Account({ username: req.body.username, reference: req.body.password, email: req.body.email }), req.body.password, function (err, account) {
    if (err) {
      return res.render('register', { title: '', user: req.user, account: account, err: 'Sorry, we are unable to register that account.' })
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/dashboard')
    })
  })
})

/* Login */
router.get('/login', (req, res) => {
  if (!req.user) {
    return res.render('login', { title: '', user: req.user })
  }

  return res.redirect('/')
})

router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/login'}), (req, res) => {
  res.redirect('/dashboard')
})

/* Logout */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err)
    res.redirect('/login')
  })
})

/* Routes requiring authentication */

/* Dashboard */
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: '', user: req.user })
})

// Catch-all route
router.get('*', (req, res) => {
  res.status(404).redirect('/')
})

module.exports = router
