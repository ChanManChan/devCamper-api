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

const Bootcamp=require('../models/Bootcamp');
// where ever we want to use advancedResults, we need to pass it in with the method
const advancedResults=require('../middleware/advancedResults');
// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// this goes from api/v1/bootcamps/.....then whatever...
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
  .route('/')
  // syntax for advancedResults :- advancedResults(model,populate) and we are implementing this middleware for getBootcamps method so lets go back to that method (controllers/bootcamps.js) and we should have access to 'res.advancedResults' object which has all the stuff in it which is basically what we want to send to the client
  .get(advancedResults(Bootcamp,'courses'),getBootcamps)
  .post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
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
