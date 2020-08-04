const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// OUR MODELS
const User = require('../../../models/User');

// keep routes in their own files
const router = express.Router();

// @route.    POST api/v1/users
// @desc.     Register User
// @access.   PUBLIC
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return server error and errors
      return res.status(400).json({ error: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check first if the user already exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'User already exists',
            },
          ],
        });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        size: '200',
        default: 'mm',
        rating: 'pg',
      });

      user = new User({
        name,
        email,
        hashed_password: password,
        avatar,
      });

      await user.save();

      // ENCRYPT PASSWORD
      const salt = await bcrypt.genSalt(10);
      user.hashed_password = await bcrypt.hash(password, salt);
      await user.save();

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
