const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc     Get reviews
// @route    GET /api/v1/reviews
// @route    GET /api/v1/:bootcampId/reviews
// @access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId});

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc     Get single review
// @route    GET /api/v1/reviews/:id
// @access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(
            new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    Create a review 
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
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

    // We now have the bootcampId attached to the req.body
    const review = await Review.create(req.body);

    return res.status(201).json({
        success: true,
        msg: 'Create a review',
        data: review,
        error: null,
    });
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`No review with the id of ${req.params.id} exists`, 404)
        )
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            // User not authorized error message - 401
            new ErrorResponse(`Not authorized to update this review with an id of ${req.params.id}})`, 401)
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        msg: 'Update a review',
        data: review,
        error: null,
    });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`No review with the id of ${req.params.id} exists`, 404)
        )
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            // User not authorized error message - 401
            new ErrorResponse(`Not authorized to delete this review with an id of ${req.params.id}})`, 401)
        );
    }

    await review.remove();

    return res.status(200).json({
        success: true,
        msg: 'Delete review',
        data: {},
        error: null,
    });
})
