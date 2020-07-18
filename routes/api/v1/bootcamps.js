const express = require('express');

const router = express.Router();

// @route.    GET api/v1/bootcamps
// @desc.     Get all bootcamps
// @access.   PUBLIC
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: { msg: 'Show all bootcamps' },
    error: null,
  });
});

// @route.    POST api/v1/bootcamps
// @desc.     Create a bootcamp
// @access.   PUBLIC
router.post('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: { msg: 'Create a bootcamp' },
    error: null,
  });
});

// @route.    PUT api/v1/bootcamps/:id
// @desc.     Update a bootcamp
// @access.   PUBLIC
router.put('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: { msg: `Update a bootcamp with ${req.params.id}` },
    error: null,
  });
});

// @route.    DELETE api/v1/bootcamps/:id
// @desc.     Delete a bootcamp
// @access.   PUBLIC
router.delete('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    data: { msg: `Delete a bootcamp with ${req.params.id}` },
    error: null,
  });
});

module.exports = router;
