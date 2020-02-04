const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');
// mergeParams:true is to make router.use('/:bootcampId/courses', courseRouter); from bootcamps.js (routes) work
const router = express.Router({ mergeParams: true });

// this isnt going to work just yet because in our server.js file, we have to implement the routes just like we did with bootcamps (//Route files section in server.js file)
// we should be abl to hit or make a get request to '/courses' and it should call our controller method 'getCourses'
//adding a course should be just on the '/' because even though its /bootcamps/:bootcampId/courses, in our bootcamps route we basically forwarded that to our courseRouter
router
  .route('/')
  .get(getCourses)
  .post(addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;
