const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser=require('cookie-parser');
// important:- if you want to be able to use this in the bootcamps controller methods it has to be after Mount routers code line (because middleware is executed in a linear order)
const errorHandler = require('./middleware/error');
// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDB();
// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());


// below is a custom middleware for logging purposes
// app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder (because we want to set our public folder to a static folder meaning we can go to whatever the 'domain is/whatever the image name is...') <--i want to be able to access the image in the browser therefore do below line of code (below i'm setting public as my static folder)
// Since public is my static folder i should be able to just go to 'http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg' to view the image...
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
// we want to be able to close the server and stop the application if we get unhandled rejection
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});
