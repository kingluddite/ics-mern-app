// @desc     Get bootcamp
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Show a bootcamp',
    error: null,
  });
};

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Show all bootcamps',
    error: null,
    // greeting: req.greeting,
  });
};

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Create a bootcamp',
    error: null,
  });
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Update a bootcamp with ${req.params.id}`,
    error: null,
  });
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete a bootcamp with ${req.params.id}`,
    error: null,
  });
};
