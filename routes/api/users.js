const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const { check, validationResult } = require('express-validator/check')
const User = require('../../models/User')

// @route POST api/users
// @description register user
// @access PUBLIC
router.post('/', [
  check('name', 'Please enter a name').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()})
  }
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email })
    if(user) { res.status(400).json({errors: [ {msg: 'User already exists'}]})}
    res.send("User Registration")

  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error');
  }
})

module.exports = router;