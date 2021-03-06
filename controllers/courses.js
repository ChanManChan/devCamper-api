const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get courses
// @route   GET /api/v1/courses                        <-- to get all courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses  <-- to get all courses related to a bootcamp
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // some changes are made due to advancedResults middleware and are marked with '**' on the changes
  //**  let query;
  if (req.params.bootcampId) {
    //** query = Course.find({ bootcamp: req.params.bootcampId });
    const courses =await Course.find({ bootcamp: req.params.bootcampId });
    //** below- because we are not going to use all the pagination and stuff if we are just getting courses for the bootcamp, we only want to use it when we are getting all the courses 
    return res.status(200).json({
      success:true,
      count:courses.length,
      data:courses
    })
  } else {
    //** BELOW IS FOR GETTING ALL OF THE COURSES 

    //** when we get all courses, we should be able to implement pagination and all that stuff 
    res.status(200).json(res.advancedResults);

    // bootcampId not found that means get all courses therefore dont pass in anything on .find() method
    // .populate() method is used to fill in required bootcamp details within each course
    //** query = Course.find().populate({
      // copy below populate object contents and pass it through advancedResults middleware in 'routes/courses.js' inside the get() method
      //** path: 'bootcamp',
      //** select: 'name description'
    //** });
  }
  //** const courses = await query;
  //** res.status(200).json({ success: true, count: courses.length, data: courses });
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
  // now we are getting from the req.user.id (logged in user's id) and put that also in the body
  req.body.user=req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

   // Make sure user is bootcamp owner, bootcamp.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless

  //  Course is associated with the bootcamp and therefore i want the owner of the bootcamp to be able to add the course and not just anybody should be able to add a course to a specific bootcamp, unless they are 'admin'
 if (bootcamp.user.toString() !== req.user.id && req.user.role!=='admin') {
  return next(
    new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401)
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

  // Make sure user is COURSE owner, course.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless

  if (course.user.toString() !== req.user.id && req.user.role!=='admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401)
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

  
  // Make sure user is COURSE owner, course.user <--this is an objectID & req.user.id <-- is a string ;;; and an admin should be able to update a bootcamp regardless

  if (course.user.toString() !== req.user.id && req.user.role!=='admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`, 401)
    );
  }
  
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
