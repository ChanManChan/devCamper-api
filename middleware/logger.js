// CUSTOM MIDDLEWARE LOGGER

// Any request we make this function is going to run (below given is the middleware)
// @desc   Logs request to console
const logger = (req, res, next) => {
  // since i created a variable in the request object, we have access to this in our routes
  // req.hello = 'Hello World';
  // console.log('Middleware ran');
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  next();
};
module.exports = logger;
