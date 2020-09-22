const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc     Get all users 
// @route    GET /api/v1/users
// @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res
        .status(200)
        .json(res.advancedResults);
});

// @desc     Get single user
// @route    GET /api/v1/users/:id
// @access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User with id of ${req.params.id} not found`, 404));
    }

    res
        .status(200)
        .json({
            success: true,
            data: user
        });
});

// @desc    Create a user 
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    return res.status(201).json({
        success: true,
        msg: 'Create a user',
        data: user,
        error: null,
    });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    // Check to make sure there is a user to update 
    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        // return the updated user 
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: user});
});

// @desc    Delete a user 
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    // Check to make sure there is a user
    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        )
    }

    user.remove();

    res.status(200).json({success: true, data: {}});
})
