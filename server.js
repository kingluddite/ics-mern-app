// INSTALL 3RD PARTY DEPENDENCIES
// load environment variables
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
// Add colors for useful terminal feedback
const colors = require('colors'); // eslint-disable-line no-unused-vars
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
// End of 3rd Party
const error = require('./middleware/error'); // custom error handler
const connectDb = require('./config/db');

// Load env vars
dotenv.config({path: './config/config.env'});// Route files

// database
// connect database
connectDb();

// Route authentication
const auth = require('./routes/api/v1/auth');
// Route resources
const users = require('./routes/api/v1/users');
const bootcamps = require('./routes/api/v1/bootcamps');
const courses = require('./routes/api/v1/courses');
const reviews = require('./routes/api/v1/reviews');

// START UP EXPRESS
const app = express();

// init middleware
// make sure you can parse data in req.body
// app.use(express.json({ extended: false }));
app.use(express.json());

// We only need morgan in our development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet({contentSecurityPolicy: false}));

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// File uploading
app.use(fileupload());

// Cookie parser
app.use(cookieParser());

// Sanitize data (prevent NoSQL injection)
app.use(mongoSanitize());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));



// routes
// quick test that api endpoint is running
// app.get('/', (req, res) => {
//     res.status(400).json({
//         success: false,
//         error: 'Did not give us what we wanted!',
//     });
// });

// DEFINE ROUTES
// Mount Route Authentication
app.use('/api/v1/auth', auth);
// Mount Route Resources
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
// app.use('/api/v1/posts', posts);
// app.use('/api/v1/apps', apps);
// app.use('/api/v1/profiles', profiles);

// IMPORTANT! If you want to execute our middleware in our controller methods it has to come after where we mount our router
// middleware is executed in a linear order
// If you put your middleware above mounted routed resources  line it won't catch it
// Custom Error handler
app.use(error);

// Define port remotely and locally
const PORT = process.env.PORT || 5000;

// So we can close the server and stop our app if we get this unhandled rejection
// We do this because if our Database isn't working we don't want our app to work
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  // Close server & exit process
  server.close(() => process.exit(1));
});
