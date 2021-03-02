const express = require('express')
const Post = require('../../models/Post')
const User = require('../../models/User')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator/check')

// @route POST api/posts
// @description add a post
// @access Private
router.post('/', [auth, [
 check('text', 'Text in a post is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }
  try{
  const user = await User.findById(req.user.id)
  const newPostFields = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id
  }
  const post = await new Post(newPostFields);
  await post.save()
  res.json(post)
  } catch(err) {
  console.error(err.message)
  res.status(500).send('Server Error')
  }
})


// @route GET api/posts
// @description get all posts
// @access PUBLIC
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})

module.exports = router;