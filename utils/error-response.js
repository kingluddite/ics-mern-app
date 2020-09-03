// We are extending the Error class that comes with Express
// We pass as arguments into our extended class a new `statusCode` property and the existing `message` property
// We use `super` to refer to the Error class and get it's `message` value
// We set `statusCode` passed to this custom error class extension
// We export the class so we can use it in other files

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
