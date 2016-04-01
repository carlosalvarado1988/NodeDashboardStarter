var path = require('path')
var express = require('express')
var router = express.Router()

// GET /
router.get('/', (req, res) => {
  res.render('index', {title: ''})
})

module.exports = router
