const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  hashed_password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) {
    // If hashed_password is not modified move to next middleware
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.hashed_password = await bcrypt.hash(this.hashed_password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // Store current user id as payload in JWT
  return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
}

// Match user entered password to hashed_password in Database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // return await bcrypt.compare(enteredPassword, this.password);
  // NOTE: When returning await you can omit await
  return await bcrypt.compare(enteredPassword, this.hashed_password);
};

UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Set reset password token to expire in 10 minutes (in milliseconds)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Return the original token (not the hashed token!)
  return resetToken;
}

module.exports = mongoose.model('User', UserSchema);
