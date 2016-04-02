const express = require('express')
const router = express.Router()

const passport = require('passport')
const Account = require('../models/account')

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
    res.render('index', {title: '', user: req.user, csrf: res.locals._csrf})
  }
})

/* Account registration */
router.get('/register', (req, res) => {
  // res.redirect('/login')
  res.render('register', {title: '', user: req.user, csrf: res.locals._csrf})
})

router.post('/register', (req, res) => {
  // res.redirect('/login')
  Account.register(new Account({ username: req.body.username }), req.body.password, function (err, account) {
    if (err) {
      return res.render('register', { title: '', user: req.user, account: account, err: 'Sorry, we are unable to register that account.', csrf: res.locals._csrf })
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/dashboard')
    })
  })
})

/* Account management */
router.get('/login', (req, res) => {
  if (!req.user) {
    // console.log(req.csrfToken())
    return res.render('login', { title: '', user: req.user, csrf: req.csrfToken() })
  }

  return res.redirect('/')
})

router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/login'}), (req, res) => {
  res.redirect('/dashboard')
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err)
    res.redirect('/login')
  })
})

/* Routes requiring authentication */
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: '', user: req.user, csrf: res.locals._csrf })
})

// Catch-all route
router.get('*', (req, res) => {
  res.status(404).redirect('/')
})

module.exports = router
