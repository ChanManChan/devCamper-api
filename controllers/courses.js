const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get courses
// @route   GET /api/v1/courses                        <-- to get all courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses  <-- to get all courses related to a bootcamp
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    // bootcampId not found that means get all courses therefore dont pass in anything on .find() method
    // .populate() method is used to fill in required bootcamp details within each course
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }
  const courses = await query;
  res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id          <-- to get all courses
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

// @desc    Add course
// the route is a bit different because a course is associated with a bootcamp, so we need a way to get that bootcampID
// @route   POST /api/v1/bootcamps/:bootcampId/courses          <-- add a new course to a specific bootcamp
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // in our Course model bootcamp is an actual field therefore i manually assign bootcampId from the request url to the req.body.bootcamp
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  // req.body will include anything thats sent from the body including the bootcamp property because i pulled it out of the URL and put it into req.body.bootcamp
  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id       <-- add a new course to a specific bootcamp
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    // returns the new version of the course
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id       <-- add a new course to a specific bootcamp
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  // im not going to do findByIdAndDelete method because we are going to add some middleware later for this therefore we need to actually use the remove method
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
