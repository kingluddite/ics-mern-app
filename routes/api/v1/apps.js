const express = require('express');

const router = express.Router();

// @route.    GET api/v1/apps
// @desc.     Test route for apps
// @access.   PUBLIC
router.get('/', (req, res) => res.send('apps route'));

module.exports = router;
