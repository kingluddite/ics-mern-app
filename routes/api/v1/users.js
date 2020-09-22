const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../../../controllers/users');

const User = require('../../../models/User');
const advancedResults = require('../../../middleware/advancedResult');

const router = express.Router();

const {protect, authorize} = require('../../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// /api/v1/users
router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

// api/v1/users/:id
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
