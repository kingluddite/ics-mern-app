const express = require('express');
const {
    getCourse,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../../../controllers/courses');

const Course = require('../../../models/Course');

const router = express.Router({mergeParams: true});

const advancedResults = require('../../../middleware/advancedResult');
const {protect, authorize} = require('../../../middleware/auth');

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
    .post(protect, authorize('publisher', 'admin'), createCourse)

// GET /api/v1/courses/:id
router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;
