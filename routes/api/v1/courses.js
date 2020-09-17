const express = require('express');
const {
  getCourse,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../../../controllers/courses');

const Course = require('../../../models/Course');
const advancedResults = require('../../../middleware/advancedResult');

const router = express.Router({mergeParams: true});

// GET /api/v1/courses
router
  .route('/')
  .get(advancedResults(Course,
    {
      path: 'bootcamp',
      select: 'name description'
    }

  ), getCourses)
  // POST /api/v1/bootcamps/:bootcampId/courses
  .post(createCourse)

// GET /api/v1/courses/:id
router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse)

module.exports = router;
