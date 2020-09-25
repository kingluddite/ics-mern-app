const express = require('express');
const {
    getReview,
    getReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../../../controllers/reviews');

const Review = require('../../../models/Review');

const router = express.Router({mergeParams: true});

const advancedResults = require('../../../middleware/advancedResult');
const {protect, authorize} = require('../../../middleware/auth');

// GET /api/v1/reviews
router
    .route('/')
    .get(advancedResults(Review,
        {
            path: 'bootcamp',
            select: 'name description'
        }
    ), getReviews)

    // POST /api/v1/bootcamps/:bootcampId/reviews
    .post(protect, authorize('user', 'admin'), createReview)

// GET /api/v1/reviews/:id
router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;
