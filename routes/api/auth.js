const express = require('express')
const router = express.Router()

// @route GET api/auth
// @description authentication test route
// @access PUBLIC
router.get('/', (req, res) => {
  res.send("Authentication route");
})

module.exports = router;