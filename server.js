var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var app = express()

// view engine setup
var path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('port', (process.env.PORT || 3000))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('express-session')({
  secret: 'check out the sunset over the lake',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log(`Server is online and listening on port ${app.get('port')}`)
})
