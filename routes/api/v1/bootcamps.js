const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../../../controllers/bootcamps');

const Bootcamp = require('../../../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const advancedResults = require('../../../middleware/advancedResult');
const { protect, authorize } = require('../../../middleware/auth');

// Re-route into other resource routers
// anything that contains :bootcampId route that into the courses router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// /api/v1/bootcamps
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// /api/v1/bootcamps/:id/photo
router.route('/:id/photos').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// /api/v1/bootcamps
router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

// api/v1/bootcamps/:id
router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
