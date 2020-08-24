// @desc Logs request to console
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );

  next();
};

module.exports = logger; // gives us access to this method in other files

// Had this in server.js and moved it here and just to show the process
// and how middleware works but morgan is better so we're using that
// keeping notes here for reference only
// Simple log middleware example
// All middleware functions take 3 arguments `req`, `res` and `next`
// We set a value on the request object (req) that we can then access on any routes that COME AFTER THIS middleware
// Don't forget to call `next()`
// In every middleware that you run you need to call `next()` in the body of the middleware function

// Show log that Express is running
