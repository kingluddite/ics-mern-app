const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/error-response');

// @desc     Get bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = async (req, res, next) => {
  const { id: bootcampIdReq } = req.params;

  try {
    const bootcamp = await Bootcamp.findById(bootcampIdReq);

    // search for a correctly formatted id but doesn't exist in our Database generate an error
    if (!bootcamp) {
      // IMPORTANT! You can't send 2 responses so you need to return the first one so it won't go to the 2nd one
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    // return res.status(400).json({ success: false });
    // next(err); // call our built-in Express error handler
    next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampIdReq}`, 404)
    );
  }
};

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    // Helper info too
    // When we get all bootcamps let's also get back the length of the bootcamps
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (err) {
    // return res.status(400).json({ success: false });
    next(new ErrorResponse(`No bootcamps found`, 404));
  }
};

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    return res.status(201).json({
      success: true,
      msg: 'Create a bootcamp',
      data: bootcamp,
      error: null,
    });
  } catch (err) {
    // Above is the easiest way to handle errors
    // - But we'll refactor to make our code more efficient and save us time when we add new things
    // console.error(err.message);
    // 400 means client error ---> they sent bad request
    // res.status(400).json({ success: false });
    next(`A bootcamp could not be created`, 404);
  }
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      // when we get our response we want the data to be the **updated** data
      new: true,
      // run our mongoose validators on update
      runValidators: true,
    });

    // make sure bootcamp exists
    if (!bootcamp) {
      // return to prevent "headers already sent error"
      return res.status(400).json({ success: false });
    }

    // We only send a status of `200` (not 201)
    // because we are not creating a new resource just modifying an existing resource
    res.status(200).json({
      success: true,
      msg: `Update a bootcamp with ${req.params.id}`,
      error: null,
      data: bootcamp,
    });
  } catch (err) {
    // console.error(err.message);
    // res.status(400).json({ success: false });
    next(`A bootcamp with the id ${req.params.id} could not be updated`, 404);
  }
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    // res.status(400).json({ success: false });
    next(
      new ErrorResponse(
        `A bootcamp with the id ${req.params.id} could not be deleted`,
        404
      )
    );
  }
};
