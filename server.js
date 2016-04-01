const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

const logger = require('morgan')

// view engine setup
const path = require('path')
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

const routes = require('./routes/index')
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
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
    user: req.user
  })
})

app.listen(app.get('port'), function () {
  console.log(`Server is online and listening on port ${app.get('port')}`)
})

module.exports = app
