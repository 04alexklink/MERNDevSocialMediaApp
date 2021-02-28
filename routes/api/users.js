const express = require('express')
const router = express.Router()

// @route POST api/users
// @description register user
// @access PUBLIC
router.post('/', (req, res) => {
  console.log(req.body);
  res.send("User Registration")
})

module.exports = router;