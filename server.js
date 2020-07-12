// Install 3rd party dependencies
const express = require('express');
// Add colors for useful terminal feedback
const colors = require('colors'); // eslint-disable-line no-unused-vars
// Require environment variables
const dotenv = require('dotenv').config({ path: './config/config.env' });
// Start up Express
const app = express();

// Quick test that API is running
app.get('/', (req, res) => res.send('API Running'));

// Define port remotely and locally
const PORT = process.env.PORT || 5000;

// Show log that Express is running
app.listen(PORT, () =>
  console.log(
    `Serveri running in ${process.env.NODE_ENV} mode and  is listening on port ${PORT}`
      .yellow.bold
  )
);
