// install 3rd party dependencies
const express = require('express');

// start up Express
const app = express();

// Quick test that API is running
app.get('/', (req, res) => res.send('API Running'));

// Define port remotely and locally
const PORT = process.env.PORT || 5000;

// Show log that Express is running
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
