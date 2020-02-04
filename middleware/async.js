// The asyncHandler receives a function and returns a function with 3 input params.This new function is responsible to execute the original function passing the three params and catching any error.
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = asyncHandler;
