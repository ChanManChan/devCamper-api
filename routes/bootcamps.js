const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

// INCLUDE OTHER RESOURCE ROUTERS

const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

// wherever we want to use advancedResults, we need to pass it in with the method
const advancedResults = require('../middleware/advancedResults');
// wherever we put 'protect' the user has to be logged in and 'authorize' is like permission for performing certain actions as a specific user role
const { protect, authorize } = require('../middleware/auth');

// RE-ROUTE INTO OTHER RESOURCE ROUTERS
router.use('/:bootcampId/courses', courseRouter);
// anything that goes to /:bootcampId/reviews, is basically going to be forwarded to the reviewRouter
router.use('/:bootcampId/reviews', reviewRouter);

// this goes from api/v1/bootcamps/.....then whatever...
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// we do want to PROTECT and AUTHORIZE below route (and make sure to put authorize after protect)
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route('/')
  // syntax for advancedResults :- advancedResults(model,populate) and we are implementing this middleware for getBootcamps method so lets go back to that method (controllers/bootcamps.js) and we should have access to 'res.advancedResults' object which has all the stuff in it which is basically what we want to send to the client
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  // we need to PROTECT and AUTHORIZE below route
  .post(protect, authorize('publisher', 'admin'), createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  // for both update and delete we want to PROTECT and AUTHORIZE the routes
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
// ROUTES
// router.get('/', (req, res) => {
// res.send('<h1>Hello from express</h1>');
// res.sendStatus(400);
// res.status(400).json({ success: false });
// res.status(200).json({ success: true, data: { id: 1, name: 'Nanda Gopal' } });
// });
// router.get('/:id', (req, res) => {

// });
// router.post('/', (req, res) => {

// });
// router.put('/:id', (req, res) => {

// });
// router.delete('/:id', (req, res) => {

// });
module.exports = router;
