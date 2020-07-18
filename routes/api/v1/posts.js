const express = require('express');

const router = express.Router();

// @route.    GET api/v1/posts
// @desc.     Test Route for posts
// @access.   PUBLIC
router.get('/', (req, res) => res.send('posts route'));

module.exports = router;
