const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from Header
  const token = req.header('x-auth-token');

  if (!token) {
    // Not Authorized client error
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign the user to the request
    req.user = decoded.user;
    next();
  } catch (err) {
    // Not Authorized client error
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
