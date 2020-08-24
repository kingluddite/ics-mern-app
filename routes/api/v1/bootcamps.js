const express = require('express');
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require('../../../controllers/bootcamps');

const router = express.Router();

// /api/v1/bootcamps
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

// api/v1/bootcamps/:id
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
