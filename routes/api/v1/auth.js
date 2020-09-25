const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout } = require('../../../controllers/auth');

const { protect } = require('../../../middleware/auth');

const router = express.Router();

// /api/v1/auth/register
router.post('/register', register);

// /api/v1/auth/login
router.post('/login', login);

// /api/v1/auth/logout
router.get('/logout', logout);

// /api/v1/auth/me
router.get('/me', protect, getMe);

// /api/v1/auth/me
router.put('/updatedetails', protect, updateDetails);

// /api/v1/auth/updatepassword
router.put('/updatepassword', protect, updatePassword);

// /api/v1/auth/forgotpassword
router.post('/forgotpassword', forgotPassword);

// /api/v1/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
