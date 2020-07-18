// INSTALL 3RD PARTY DEPENDENCIES
// Require environment variables
const dotenv = require('dotenv').config({ path: './config/config.env' });
const express = require('express');
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

// DATABASE
// Connect Database
connectDb();

// INIT MIDDLEWARE
// Make sure you can parse data in req.body
app.use(express.json({ extended: false }));

// ROUTES
// Quick test that API endpoint is running
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

// Show log that Express is running
app.listen(PORT, () =>
  console.log(
    `Serveri running in ${process.env.NODE_ENV} mode and is listening on port ${PORT}`
      .yellow.bold
  )
);
