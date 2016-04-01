var express = require('express')
var router = express.Router()

// GET /
router.get('/', (req, res) => {
  res.render('index', {title: '', user: req.user})
})

module.exports = router
