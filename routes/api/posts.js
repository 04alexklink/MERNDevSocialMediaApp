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
  if(post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
    return res.status(400).json({msg: 'Post already liked by user.'})
  }
  post.likes.unshift({user: req.user.id});
  await post.save()
  res.json(post.likes)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route PUT api/posts/unlike/:id
// @description unlike a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
  const post = await Post.findById(req.params.id)
  if(post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
    return res.status(400).json({msg: 'Post has not been liked by this user.'})
  }
  const unlikeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id)
  post.likes.splice(unlikeIndex, 1)
  await post.save()
  res.json(post.likes)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route POST api/posts/comment/:id
// @description comment on a post
// @access Private
router.post('/comment/:id', [auth, [
check('text', 'Comments must contain text').not().isEmpty() ]],async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()})
    }
  try {
    //find post to comment on from the header :id
  const post = await Post.findById(req.params.id)
  // find user whose logged in and making the request to comment
  const user = await User.findById(req.user.id).select('-password')
  // create new comment object
  const newComment = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id
  }
  post.comments.unshift(newComment)
  await post.save()
  res.json(post.comments)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route DELETE api/posts/comment/:id/:comment_id
// @description delete a comment on a post
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
  // find post
  const post = await Post.findById(req.params.id)
  // find comment
  const comment = post.comments.filter((comment) => {
    if(comment.id === req.params.comment_id) {
      return comment
    }
  })
  // see if comment exists. If not, send json saying this comment doesn't exist
  if(comment.length === 0) {return res.status(400).json({msg: 'Comment does not exist.'})}
  // check if comment was created by the user trying to delete it
  if((comment[0].user.toString() !== req.user.id) && (post.user.toString() !== req.user.id)) {
    return res.status(401).json({msg: "User not authorised to delete this comment"})
  }
  // if user owns the post or the comment, then proceed to delete
  const commentIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id)
  post.comments.splice(commentIndex, 1)
  post.save()
  res.json( post.comments)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})
module.exports = router;