const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    //** BELOW IS FOR GETTING ALL OF THE REVIEWS

    //** when we get all reviews, we should be able to implement pagination and all that stuff therefore use advancedResults middleware
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  // '.populate()' because i want to get the bootcamp's 'name' and 'description'
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: review });
});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  // i need to add the bootcampId (and logged in user's ID which is not in the URL) thats in the URL to the data (review) that we are submitting
  req.body.bootcamp = req.params.bootcampId; //<-- to know for which bootcamp the review belongs to
  // set the logged in user's id too (to know who wrote the review)
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  // 'req.body' is going to have all the body data thats submitted and in addition to that its going to have the bootcampId and the user ID.
  const review = await Review.create(req.body);

  res.status(201).json({ success: true, data: review });
});

// @desc    Upadte review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  // we need to make sure that the review belongs to the logged in user unless its an admin (admin can edit anything in the API)
  // review.user is going to be an ObjectId so convert it to string so that we can compare
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  // we need to make sure that the review belongs to the logged in user unless its an admin (admin can edit anything in the API)
  // review.user is going to be an ObjectId so convert it to string so that we can compare
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this review`, 401));
  }

  await review.remove();

  res.status(200).json({ success: true, data: {} });
});
