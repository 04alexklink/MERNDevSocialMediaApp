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
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1})
    res.json(posts)
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route GET api/posts/:id
// @description get post by id
// @access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if(!post) {return res.status(400).json({msg: 'This post does not exist'})}
    res.json(post)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route DELETE api/posts/:id
// @description delete post by id
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if(!post) {return res.status(404).json({msg: 'This post does not exist to delete'})}
    if(post.user.toString() !== req.user.id) { return res.status(400)
      .json({msg: 'This post can only be deleted by the owner of the post'})
    }
    await Post.findOneAndDelete({_id: req.params.id})
    res.json({msg: 'Post has been deleted'})
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route PUT api/posts/like/:id
// @description like a post
// @access Private
router.put('/like/:id', auth, async (req, res) => {
  try {
  const post = await Post.findById(req.params.id)
  console.log(post, "POST")
  if(post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
    res.status(400).json({msg: 'Post already liked by user.'})
  }
  post.likes.unshift({user: req.user.id});
  await post.save()
  res.json(post.likes)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})

module.exports = router;