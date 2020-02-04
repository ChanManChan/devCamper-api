const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
// important:- if you want to be able to use this in the bootcamps controller methods it has to be after Mount routers code line (because middleware is executed in a linear order)
const errorHandler = require('./middleware/error');
// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDB();
// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();
// Body parser
app.use(express.json());
// below is a custom middleware for logging purposes
// app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

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
