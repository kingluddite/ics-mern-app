const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc     Get courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    // Check if `:bootcampId` exists
    if (req.params.bootcampId) {
        //   If it does then we just get the courses from the bootcamps
        const courses = await Course.find({bootcamp: req.params.bootcampId})

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        //   If it DOES NOT then we'll get all of the courses
        res
            .status(200)
            .json(res.advancedResults);
    }

})

// @desc     Get single course
// @route    GET /api/v1/courses/:id
// @access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);
    }

    // console.log(course);

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Create a course 
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    // grab bootcamp id from URL
    req.body.bootcamp = req.params.bootcampId;
    // grab user id from logged in user
    req.body.user = req.user.id;

    // grab the bootcamp by it's id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId} exists`, 404)
        )
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.params.id && req.user.role !== 'admin') {
        return next(
            // User not authorized error message - 401
            new ErrorResponse(`User ${req.user.name} (${req.user.id}) is not authorized to add a course to bootcamp ${bootcamp.name} (${bootcamp._id})`, 401)
        );
    }

    // We now have the bootcampId attached to the req.body
    const course = await Course.create(req.body);

    return res.status(201).json({
        success: true,
        msg: 'Create a course',
        data: course,
        error: null,
    });
})

// @desc    Update a course 
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    // grab the bootcamp by it's id
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id} exists`, 404)
        )
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.params.id && req.user.role !== 'admin') {
        return next(
            // User not authorized error message - 401
            new ErrorResponse(`User ${req.user.name} (${req.user.id}) is not authorized to update a course to bootcamp ${course.name} (${course._id})`, 401)
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // so it returns the new version of the course
        runValidators: true
    });

    return res.status(201).json({
        success: true,
        msg: 'Update a course',
        data: course,
        error: null,
    });
})

// @desc    Delete a course 
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    // grab the bootcamp by it's id
    const course = await Course.findById(req.params.id);

    // Did we find a course that we want to delete?
    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id} exists`, 404)
        )
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.params.id && req.user.role !== 'admin') {
        return next(
            // User not authorized error message - 401
            new ErrorResponse(`User ${req.user.name} (${req.user.id}) is not authorized to update a course to bootcamp ${course.name} (${course._id})`, 401)
        );
    }

    // TODO: Add user to req.body
    // We need to use the mongodb remove() method because we will be adding middleware later
    // and it won't trigger if we use Course.findOneAndDelete()
    await course.remove(); // we don't need to store this in a variable
    return res.status(200).json({
        success: true,
        msg: 'Delete a course',
        data: {}, // standard is to return an emtpy object in the response
        error: null,
    });
})


