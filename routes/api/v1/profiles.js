const express = require('express');
const axios = require('axios');
const { check, validationResult } = require('express-validator');
const auth = require('../../../middleware/auth');
const Profile = require('../../../models/Profile');
const User = require('../../../models/User');

const router = express.Router();

// @route.    GET api/v1/profiles/me
// @desc.     Get current user profile
// @access.   Private
router.get('/me', auth, async (req, res) => {
  try {
    // try to find the profile using the user id in the token
    // also grab the name and avatar off the user object using mongoose's populate()
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    // Check if we have a profile
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    // There is a profile so send it in the response
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500).send('Server Error');
  }
});

// @route. POST api/v1/profiles/profile
// @desc. Create or update a user profile
// @access. Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skill', 'Skills are required'),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      github_username, // eslint-disable-line camelcase
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (github_username) profileFields.github_username = github_username; // eslint-disable-line camelcase
    if (skills) {
      // console.log(typeof skills) // string
      // create an array based on each comma, map through them and remove spaces
      //  // and store inside our profileFields object in its skills property
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // what's our profile object look like
    // console.log(profileFields.skills);

    // Build social object
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    // now we're ready to update
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create Profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route. GET api/v1/profiles
// @desc. Get all profiles
// @access. Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route. GET api/v1/profiles/users/:user_id
// @desc. Get profile by user id
// @access. Public
router.get('/users/:user_id', async (req, res) => {
  const { user_id } = req.params; // eslint-disable-line camelcase

  try {
    const profile = await Profile.findOne({
      user: user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.status(500).send('Server Error');
  }
});

// @route.    DELETE /api/v1/profiles
// @desc.     Delete profile, user and posts
// @access.   PRIVATE
router.delete('/', auth, async (req, res) => {
  const { id } = req.user;

  try {
    // @TODO - REMOVE USER's posts

    // Remove profile
    await Profile.findOneAndRemove({ user: id });
    // Remove user
    await User.findOneAndRemove({ _id: id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route.    PUT api/v1/profiles/experiences
// @desc.     Add profile experience
// @access.   PRIVATE
router.put(
  '/experiences',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const { id } = req.user;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure our stuff off the request body
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // Create an object with the data the user submits
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: id });

      if (!profile) {
        console.log('profile not found');
        return res.status(400).json({ msg: 'Profile not found' });
      }

      // if we got here we found the profile!

      // we use unshift() to add the new experience at the end of the array
      // rather than the beginning using push()
      profile.experience.unshift(newExp);

      // we added our new experience to the profile!
      // Now we need to save it to our Database using mongoose's save()
      await profile.save();

      // now we'll return the profile in the response
      // we'll use that in the frontend with react
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route.    DELETE api/v1/profiles/experiences/exp_id:
// @desc.     Delete an experience
// @access.   PRIVATE
router.delete('/experiences/:exp_id', auth, async (req, res) => {
  try {
    const { id } = req.user;
    const { exp_id } = req.params; // eslint-disable-line camelcase
    const profile = await Profile.findOne({ user: id });
    // create a new array using map()
    // grab each experience id
    // we find the id in the URL and if the item.id matches the exp_id we
    // get the index of where that happened in the array
    // and we store that index number inside our removeIndex variable
    const removeIndex = profile.experience.map(item => item.id).indexOf(exp_id);

    // make sure we find a match before we delete experience item
    // removeIndex would be -1 if we didn't find a match
    if (removeIndex !== -1) {
      // find experience and remove it
      profile.experience.splice(removeIndex, 1);
    } else {
      console.error('Experience not found');
      return res.status(500).send('Experience not found');
    }

    // save in Database
    await profile.save();

    // return the profile to the client to use in frontend with react
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// MORE CODE
// @route.    PUT api/v1/profiles/educations
// @desc.     Add profile education
// @access.   PRIVATE
router.put(
  '/educations',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('field_of_study', 'Field of Study is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      field_of_study, // eslint-disable-line camelcase
    } = req.body;

    // Create an object with the data the user submits
    const newEducation = {
      school,
      degree,
      field_of_study,
    };

    try {
      const { id } = req.user;
      const profile = await Profile.findOne({ user: id });

      if (!profile) {
        console.log('profile not found');
        return res.status(400).json({ msg: 'Profile not found' });
      }
      // we use unshift to add the new education at the end of the array (rather than beginning with push() array method)
      profile.education.unshift(newEducation);
      // console.log(profile.education);
      // We found the profile
      // We added our new education to the profile
      // Now we need to save it to our DB using Mongoose `save()`
      await profile.save();

      // We return the profile in the response that we'll use in the frontend (React) later on
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route.    DELETE api/v1/profiles/educations/edu_id:
// @desc.     Delete an education
// @access.   PRIVATE
router.delete('/educations/:edu_id', auth, async (req, res) => {
  // use try catch to see if our code will work
  // if not we'll throw an error
  try {
    // Grab the user profile
    // MAKE SURE TO USE await!
    // You'll need to get the user id from the request object
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    // we use map to create a new array
    // we look at each education in array and
    //  grab it's id (this is the unique `_id` mongo was kind enough to create for us when we
    //  created an education
    //  when we find the id in the URL (the last part will be the education id and we can access that with :education in our route))
    // if the item id matches the exp_id we will get the index of where that happened in the array
    // we store that index number inside removeIndex variable

    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    // Make sure we find a match before we delete
    if (removeIndex !== -1) {
      // find the education item and remove it
      profile.education.splice(removeIndex, 1);
    } else {
      console.error('Education not found');
      return res.status(500).send('education not found');
    }

    // don't forget to tell Mongoose to save this
    // in your Database
    await profile.save();

    // return the profile to the client
    // we can use this with react if we want
    // to give the end user some feedback
    // make sure to check and see that the education
    // you deleted is gone from the education array
    res.json(profile);
  } catch (err) {
    // if we have an error show it
    console.error(err.message);
    // always return a status in the response
    // we use 500 to show server error
    res.status(500).send('Server Error');
  }
});

// @route.    GET api/v1/profiles/githubs/:username
// @desc.     Get user repos from GitHub
// @access.   PUBLIC
router.get('/githubs/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const uri = encodeURI(
      `https://api.github.com/users/${username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });

    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ msg: 'No Github profile found' });
  }
});

module.exports = router;
