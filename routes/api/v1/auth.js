const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../../middleware/auth');
// Add our Models
const User = require('../../../models/User');

const router = express.Router();

// @route.    GET api/v1/auth
// @desc.     Get user by token
// @access.   PRIVATE
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-hashed_password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route.    POST api/v1/auth
// @desc.     Authenticate user and get token (login)
// @access.   PUBLIC
router.post(
  '/',
  [
    check('email', 'Please include valid email').isEmail(),
    check('password', 'Please enter a password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return server error and errors
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check first if the user already exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid Credentials',
            },
          ],
        });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.hashed_password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid Credentials',
            },
          ],
        });
      }

      // RETURN JWT (JSONWEBTOKEN)
      // Create payload and put user "id" inside it
      const payload = {
        user: {
          id: user.id,
        },
      };
      // Sign the token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send(`Server error`);
    }
  }
);

module.exports = router;
