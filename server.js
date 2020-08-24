// INSTALL 3RD PARTY DEPENDENCIES
// load environment variables
const dotenv = require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const morgan = require('morgan');
// Add colors for useful terminal feedback
const colors = require('colors'); // eslint-disable-line no-unused-vars
const connectDb = require('./config/db');
// Route files
// Route authentication
const auth = require('./routes/api/v1/auth');
// Route resources
const users = require('./routes/api/v1/users');
const posts = require('./routes/api/v1/posts');
const apps = require('./routes/api/v1/apps');
const profiles = require('./routes/api/v1/profiles');
const bootcamps = require('./routes/api/v1/bootcamps');

// START UP EXPRESS
const app = express();

// custom logger
// const logger = require('./middleware/logger');
// We use the much more powerful morgan logger
// const logger = (req, res, next) => {
//   req.greeting = 'hello from middleware';
//   console.log('middleware ran!');
//   next();
// };

// important! you can never use middleware unless you use `app.use()` method
// app.use(logger);
// our powerful logger

// We only need morgan in our development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// database
// connect database
connectDb();

// init middleware
// make sure you can parse data in req.body
app.use(express.json({ extended: false }));

// routes
// quick test that api endpoint is running
app.get('/', (req, res) => {
  res.status(400).json({
    success: false,
    error: 'Did not give us what we wanted!',
  });
});

// DEFINE ROUTES
// Mount Route Authentication
app.use('/api/v1/auth', auth);
// Mount Route Resources
app.use('/api/v1/users', users);
app.use('/api/v1/posts', posts);
app.use('/api/v1/apps', apps);
app.use('/api/v1/profiles', profiles);
app.use('/api/v1/bootcamps', bootcamps);

// Define port remotely and locally
const PORT = process.env.PORT || 5000;

// Simple log middleware example
// All middleware functions take 3 arguments `req`, `res` and `next`
// We set a value on the request object (req) that we can then access on any routes that COME AFTER THIS middleware
// Don't forget to call `next()`
// In every middleware that you run you need to call `next()` in the body of the middleware function

// Show log that Express is running
app.listen(PORT, () =>
  console.log(
    `Serveri running in ${process.env.NODE_ENV} mode and is listening on port ${PORT}`
      .yellow.bold
  )
);
