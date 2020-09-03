// This will give a 500 Internal Server Error
// The format will be JSON instead of the default Express Error HTML
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.stack.red);

  // res.status(500).json({
  //   success: false,
  //   error: err.message,
  // });

  res
    // do we have a statusCode? If not, use 500
    .status(err.statusCode || 500)
    // Is there an err.message? If not, default to ""Server Error""
    .json({ success: false, error: err.message || 'Server Error' });
};

module.exports = errorHandler;
