const express = require('express');
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

module.exports = router;
