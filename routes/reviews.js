const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

const Review = require('../models/Review');

// mergeParams:true is to make router.use('/:bootcampId/reviews', reviewRouter); from bootcamps.js (routes) work basically adjusting for  RE-ROUTE INTO OTHER RESOURCE ROUTERS
const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
// wherever we put 'protect' the user has to be logged in and 'authorize' is like permission for performing certain actions as a specific user role
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      // THIS IS POPULATE PARAM
      // we will also get the bootcamp object with the below given select fields in every type of query because i did populate it here
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
