const express = require('express');

const router = express.Router();

// @route.    GET api/v1/profiles
// @desc.     description
// @access.   PUBLIC
router.get('/', (req, res) => res.send('profiles route'));

module.exports = router;
