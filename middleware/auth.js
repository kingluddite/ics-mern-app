const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {

  // Get token from Header
  // const token = req.header('x-auth-token');
  const {authorization} = req.headers;
  let token;

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists (whether through cookies or authorization)
  if (!token) {
    // Not Authorized client error
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // let's see what the decoded token looks like
    console.log(decoded);

    // Assign the user to the request
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    // Not Authorized client error
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    // Forbidden error status
    return next(
      new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
    );
  }
  next();
};
