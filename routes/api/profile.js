const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { check, validationResult} = require('express-validator/check')
const request = require('request')
const config = require('config')

// @route GET api/profile/me
// @description gets your profile based on user id in the token sent in the request
// @access PRIVATE
router.get('/me', auth, async (req, res) => {
  try{
    const profile = await Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    if(!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'})
    }
    res.json(profile)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route GET api/profile/user/:user_id
// @description gets profile by user id
// @access PUBLIC
router.get('/user/:user_id', async (req, res) => {
  try{
    const profile = await Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    if(!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'})
    }
    res.json(profile)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route POST api/profile
// @description create or update a profile
// @access PRIVATE
router.post('/', [auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.status(400).json({errors: errors.array()})
  }
  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  // Build social object
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (facebook) profileFields.social.facebook = facebook;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;
  
  try{
  let profile = await Profile.findOne({user: req.user.id})
  if(profile) {
    profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})
    return res.json(profile)
  }
  profile = new Profile(profileFields)
  await profile.save()
  return res.json(profile)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})

// @route GET api/profile
// @description gets all profiles
// @access PUBLIC
router.get('/', async (req, res) => {
  try{
    let profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route DELETE api/profile
// @description delete profile, user & posts
// @access PRIVATE
router.delete('/', auth, async (req, res) => {
  try{
    await Profile.findOneAndDelete({user: req.user.id});
    await User.findOneAndDelete({_id: req.user.id})
    res.json({msg: 'User has been deleted.'})
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route PUT api/profile/experience
// @description add profile experience
// @access PRIVATE
router.put('/experience', [auth,[
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }
  const {
    title,
    company, 
    location, 
    from, 
    to, 
    current, 
    description} = req.body

  const newExp = {
    //title = title
    title, 
    company, 
    location,
    from,
    to,
    current,
    description
  }
  try{
  const profile = await Profile.findOne({user: req.user.id})
  // what happens if user adds experience without having created a profile first? Edge case
  // in this case profile wont' be found, and the below adding experience won't work
  profile.experience.unshift(newExp)
  await profile.save();
  res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route DELETE api/profile/experience/:exp_id
// @description delete a profile experience
// @access PRIVATE
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try{
  const profile = await Profile.findOne({user: req.user.id})
  // const removeIndex = profile.experience.map((experience) => experience.id).indexOf(req.params.exp_id)
  // profile.experience.splice(removeIndex, 1)
  const updatedProfileExperiences= profile.experience.filter((experience) => {
    if(experience.id !== req.params.exp_id) return experience
  })
  profile.experience = updatedProfileExperiences
  await profile.save();
  res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route PUT api/profile/education
//@ description add education to a profile
// @ access Private
router.put('/education', [auth,[
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEduc = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }
  try{
    let profile = await Profile.findOne({user: req.user.id})
    profile.education.unshift(newEduc)
    await profile.save()
    res.json(profile)
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})
// @route DELETE api/profile/education/:edu_id
// @description delete a profile education
// @access PRIVATE
router.delete('/education/:edu_id', auth, async (req, res) => {
  try{
  const profile = await Profile.findOne({user: req.user.id})
  // const removeIndex = profile.education.map((education) => education.id).indexOf(req.params.edu_id)
  // profile.education.splice(removeIndex, 1)
  const updatedProfileEducations= profile.education.filter((education) => {
    if(education.id !== req.params.edu_id) return education
  })
  profile.education = updatedProfileEducations
  await profile.save();
  res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route GET api/profile/github/:username
// @description gets user repos from github
// @access PUBLIC
router.get('/github/:username', async (req, res) => {
  try{
    const options = {
      uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5
      &sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecretKey')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    }
    request(options, (error, response, body) => {
      if(error) console.error(error);
      if(response.statusCode !== 200) {
        return res.status(404).json({msg: 'No GH profile found'})
      }
      res.json(JSON.parse(body))
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
module.exports = router;