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


// So we can close the server and stop our app if we get this unhandled rejection
// We do this because if our Database isn't working we don't want our app to work
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  // Close server & exit process
  server.close(() => process.exit(1));
});
