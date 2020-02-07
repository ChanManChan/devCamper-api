const ErrorResponse = require('../utils/errorResponse');
// Custom error middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  // console.log(err.name);
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    //errors is an array of objects that has a bunch of different fields in each object and we just want the message
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' });
};
// since this is middleware we need to run it through app.use in order to use it!
module.exports = errorHandler;
