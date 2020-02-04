class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Error class that we are extending, we want to call that constructor
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ErrorResponse;
