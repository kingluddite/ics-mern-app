const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/error-response');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = {...req.query};

  // Fields to exclude
  // An array of fields that we don't want to be matched for filtering
  const removeFields = ['select', 'sort'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create mongodb operators ($gt, $gte, $lt, $lte, $in)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr))

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // default will be to sort by createdAt data in descending order
    query = query.sort('-createdAt');
  }

  // Executing query
  const bootcamps = await query;
  //
  // When we get all bootcamps let's also get back the length of the bootcamps
  res
    .status(200)
    .json({success: true, count: bootcamps.length, data: bootcamps});

  // return res.status(400).json({ success: false });
  // next(new ErrorResponse(`No bootcamps found`, 404));
});

// @desc     Get bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const {id: bootcampIdReq} = req.params;
  const bootcamp = await Bootcamp.findById(bootcampIdReq);

  // search for a correctly formatted id but doesn't exist in our Database generate an error
  if (!bootcamp) {
    // IMPORTANT! You can't send 2 responses so you need to return the first one so it won't go to the 2nd one
    // return res.status(400).json({success: false});
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampIdReq}`, 404)
    )
  }

  res.status(200).json({success: true, data: bootcamp});
});


// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  const bootcamp = await Bootcamp.create(req.body);

  return res.status(201).json({
    success: true,
    msg: 'Create a bootcamp',
    data: bootcamp,
    error: null,
  });
})

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    // when we get our response we want the data to be the **updated** data
    new: true,
    // run our mongoose validators on update
    runValidators: true,
  });

  // make sure bootcamp exists
  if (!bootcamp) {
    // return to prevent "headers already sent error"
    return res.status(400).json({success: false});
  }

  // We only send a status of `200` (not 201)
  // because we are not creating a new resource just modifying an existing resource
  res.status(200).json({
    success: true,
    msg: `Update a bootcamp with ${req.params.id}`,
    error: null,
    data: bootcamp,
  });

  next(`A bootcamp with the id ${req.params.id} could not be updated`, 404);
})

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({success: true, data: bootcamp});
  // res.status(400).json({ success: false });
  next(
    new ErrorResponse(
      `A bootcamp with the id ${req.params.id} could not be deleted`,
      404
    )
  );
})

// @desc Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const {zipcode, distance} = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 3963;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {$centerSphere: [[lng, lat], radius]}
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})
