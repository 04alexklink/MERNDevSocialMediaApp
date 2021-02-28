const express = require('express')
const router = express.Router()

// @route GET api/posts
// @description posts test route
// @access PUBLIC
router.get('/', (req, res) => {
  res.send("Posts route");
})

module.exports = router;