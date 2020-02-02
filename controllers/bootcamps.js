const Bootcamp = require('../models/Bootcamp');
// In here we are going to create different methods that are going to be associated with certain routes and we need to export each method so that we can bring it in to the routes file

//Basically these are middleware functions

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps    <---associated with this controller method
// @access  Public                   <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (err) {
    res.status(400).json({ success: false });
  }
  // res
  //   .status(200)
  //   .json({ success: true, msg: 'Show all bootcamps' /*hello: req.hello*/ });
};

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Public                     <---do you need to be logged in to hit this route (send a token)(public === you dont need a token)
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    // if client requests a correctly formatted id thats not in the database do below
    if (!bootcamp) {
      // since we have within the try block two responses ie. 'res.status' and even though this is an if statement, this is going to give us an error that says the headers are already sent....therefore when we have something like this make sure we return the first one
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Show single bootcamp ${req.params.id}` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps  <---associated with this controller method
// @access  Private                 <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.createBootcamp = async (req, res, next) => {
  // in order to use req.body we have to add a piece of middleware thats included with express
  // console.log(req.body);
  // res.status(200).json({ success: true, msg: 'Create new bootcamp' });
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    res.status(400).json({
      success: false
    });
  }
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Private                    <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      // new:true because when we get our response, we want the data to be the updated data ie the new data
      new: true,
      runValidators: true
    });
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id  <---associated with this controller method
// @access  Private                       <---do you need to be logged in to hit this route (send a token)(private === you need a token)
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
  // res
  //   .status(200)
  //   .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
