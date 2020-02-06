const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

const Course=require('../models/Course');

// mergeParams:true is to make router.use('/:bootcampId/courses', courseRouter); from bootcamps.js (routes) work
const router = express.Router({ mergeParams: true });


const advancedResults=require('../middleware/advancedResults');
// wherever we put 'protect' the user has to be logged in and 'authorize' is like permission for performing certain actions as a specific user role
const {protect,authorize} =require('../middleware/auth');


// this isnt going to work just yet because in our server.js file, we have to implement the routes just like we did with bootcamps (//Route files section in server.js file)
// we should be abl to hit or make a get request to '/courses' and it should call our controller method 'getCourses'
//adding a course should be just on the '/' because even though its /bootcamps/:bootcampId/courses, in our bootcamps route we basically forwarded that to our courseRouter
router
  .route('/')
  .get(advancedResults(Course,{
    // we need to change the controller method 'getCourses' inside 'controllers/courses.js'
    // we will also get the bootcamp object with the below given select fields in every type of query because i did populate it here
    path: 'bootcamp',
    select: 'name description'
  }),getCourses)
  // PROTECT and AUTHORIZE below route
  .post(protect,authorize('publisher','admin'),addCourse);

router
  .route('/:id')
  .get(getCourse)
  // PROTECT and AUTHORIZE update and delete course
  .put(protect,authorize('publisher','admin'),updateCourse)
  .delete(protect,authorize('publisher','admin'),deleteCourse);

module.exports = router;
