const express = require('express')
const router = express.Router()

// @route GET api/users
// @description users test route
// @access PUBLIC
router.get('/', (req, res) => {
  res.send("User route");
})

module.exports = router;